#!/usr/bin/env python3
"""Read-only finalized GSC comparisons and aggregate website enquiry counts.
Requires existing gsc-inspect.py auth (cryptography) and AWS CLI profile mine.
Never writes Google/AWS data or exports enquiry names, email or message content.
"""
import argparse
from collections import Counter
from datetime import date, datetime, timedelta, timezone
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

SITE = 'sc-domain:rohitraj.tech'
URL = 'https://www.googleapis.com/webmasters/v3/sites/' + urllib.parse.quote(SITE, safe='') + '/searchAnalytics/query'
CLUSTERS = {
    'fde': r'\bfde[s]?\b|forward[ -]deployed|fractional.*engineer',
    'ai-engineering': r'\bai engineer|\bai architect|artificial intelligence engineer',
    'ai-consulting': r'\bai consult|\bai implementation|\bai integration',
    'rag': r'\brag\b|retrieval[ -]augmented|vector database|pgvector',
}
TERMS = ['forward deployed engineer','hire a forward deployed engineer','freelance fde','fractional forward deployed engineer','freelance ai engineer','hire freelance ai engineer','ai engineer india','fractional ai engineer','ai consultant','ai consultant india','rag implementation','rag implementation cost','rag evaluation','rag consultant']
TARGETS = ['forward-deployed-engineer','fractional-ai-engineer','mcp-integration-consultant','fractional-forward-deployed-engineer']


def query(token, start, end, dimensions=()):
    rows = []
    while True:
        body = dict(startDate=str(start), endDate=str(end), type='web', dataState='final', dimensions=list(dimensions), rowLimit=25000, startRow=len(rows))
        req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'})
        with urllib.request.urlopen(req, timeout=45) as response:
            payload = json.load(response)
        batch = payload.get('rows', [])
        rows.extend(batch)
        if len(batch) < 25000:
            return rows


def aggregate(rows):
    if not rows:
        return None
    impressions = sum(row['impressions'] for row in rows)
    clicks = sum(row['clicks'] for row in rows)
    return dict(impressions=impressions, clicks=clicks, ctr=clicks/impressions if impressions else None,
                position=sum(row['position'] * row['impressions'] for row in rows)/impressions if impressions else None)


def window(token, start, end):
    queries = query(token, start, end, ['query'])
    pages = query(token, start, end, ['page'])
    return {'start':str(start),'end':str(end),'property':aggregate(query(token, start, end)),
            'clusters':{name:aggregate([r for r in queries if re.search(pattern,r['keys'][0],re.I)]) for name,pattern in CLUSTERS.items()},
            'keywords':{term:aggregate([r for r in queries if r['keys'][0].lower()==term]) for term in TERMS},
            'relevant_queries':[r for r in queries if any(re.search(pattern,r['keys'][0],re.I) for pattern in CLUSTERS.values())],
            'pages':[r for r in pages if '/services/' in r['keys'][0] or any(word in r['keys'][0] for word in ('/notes/rag-', 'forward-deployed','freelance-ai-engineer'))]}


def count_enquiries(items, start, end):
    # Align calendar boundaries with GSC's Pacific dates. IDs stay in memory only.
    counts = Counter()
    seen = set()
    for row in items:
        key = row.get('id',{}).get('S','')
        if not key.startswith('enquiry:') or key in seen:
            continue
        raw = row.get('received_at',{}).get('S')
        if not raw:
            continue
        stamp = datetime.fromisoformat(raw.replace('Z','+00:00'))
        if stamp.tzinfo is None:
            raise ValueError('Enquiry timestamp lacks timezone')
        if start <= stamp.astimezone(ZoneInfo('America/Los_Angeles')).date() <= end:
            # Never export arbitrary user-provided paths or query strings.
            source = row.get('source_path',{}).get('S','')
            category = source if source in ('/contact','/hire') else 'other'
            counts[category] += 1
            seen.add(key)
    return {'total':sum(counts.values()),'by_form_page':dict(counts)}


def enquiry_items(profile):
    command = ['aws','dynamodb','scan','--table-name','rohitraj-tech-enquiries',
               '--region','ap-south-1','--profile',profile,'--consistent-read',
               '--projection-expression','id, source_path, received_at','--output','json']
    run = subprocess.run(command, capture_output=True, text=True, timeout=90)
    if run.returncode:
        raise RuntimeError('Read-only enquiry aggregation failed; check AWS profile permissions')
    return json.loads(run.stdout)['Items']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--key',type=Path,default=Path.home()/'.config/gsc/indexing-sa.json')
    parser.add_argument('--aws-profile',default='mine')
    args=parser.parse_args()
    spec=importlib.util.spec_from_file_location('gsc',Path(__file__).with_name('gsc-inspect.py'))
    gsc=importlib.util.module_from_spec(spec);spec.loader.exec_module(gsc)
    token=gsc.get_token(str(args.key))
    if not token:
        raise RuntimeError('GSC authentication unavailable')
    today=datetime.now(ZoneInfo('America/Los_Angeles')).date()
    dates=query(token,today-timedelta(days=35),today,['date'])
    if not dates:
        raise RuntimeError('No finalized GSC dates available')
    end=max(date.fromisoformat(r['keys'][0]) for r in dates)
    start=end-timedelta(days=27);previous_end=start-timedelta(days=1);previous_start=previous_end-timedelta(days=27)
    report={'checked_at':datetime.now(timezone.utc).isoformat(),'data_state':'final','search_type':'web','country_device':'all',
            'current':window(token,start,end),'previous':window(token,previous_start,previous_end),'indexing':{},'errors':[],
            'limitations':['Average GSC position is not a fixed live rank; low impression counts are noisy.',
                          'Missing query rows are unreported, not zero. Privacy filtering and top-row limits apply.',
                          'Clusters overlap and use disclosed query rows; do not add them or compare their sum with property totals.',
                          'Website enquiries include all traffic sources and may include spam/tests. They are not qualified or SEO-attributed leads.',
                          'Enquiry records have a 90-day retention policy; earlier periods can be incomplete.']}
    for slug in TARGETS:
        url='https://rohitraj.tech/services/'+slug
        try:
            status=gsc.inspect(token,url)
            report['indexing'][url]={k:status.get(k) for k in ('verdict','coverageState','lastCrawlTime','googleCanonical','userCanonical','robotsTxtState','pageFetchState','indexingState')}
        except Exception as exc:
            report['errors'].append(f'URL inspection failed for {slug}: {type(exc).__name__}')
    try:
        items=enquiry_items(args.aws_profile)
        report['enquiries']={'current':count_enquiries(items,start,end),'previous':count_enquiries(items,previous_start,previous_end)}
    except Exception as exc:
        report['enquiries']=None
        report['errors'].append(f'Enquiry counts unavailable: {type(exc).__name__}')
    args.output.parent.mkdir(parents=True,exist_ok=True)
    temporary=args.output.with_suffix('.tmp')
    temporary.write_text(json.dumps(report,indent=2)+'\n');temporary.replace(args.output)
    print(json.dumps({'output':str(args.output),'through':str(end),'current':report['current']['property'],'enquiries':report['enquiries'],'errors':report['errors']},indent=2))
    return 1 if report['errors'] else 0


if __name__=='__main__':
    raise SystemExit(main())
