#!/usr/bin/env python3
"""Offline retrieval/access regression checks. Python 3.10+, standard library only.
Usage: python3 evaluate.py cases.json results.json [--k 3]
Exit 0: checks pass; 1: quality/access failure; 2: invalid input.
Does NOT measure answer truth, claim support, production security or latency.
"""
import argparse
import json
import sys
from pathlib import Path


def indexed(rows, label):
    if not isinstance(rows, list) or not rows:
        raise ValueError(f'{label} must be a nonempty list')
    out = {}
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get('id'), str) or not row['id']:
            raise ValueError(f'{label}: each row needs a nonempty string id')
        if row['id'] in out:
            raise ValueError(f'{label}: duplicate id {row["id"]}')
        out[row['id']] = row
    return out


def ids(row, field):
    values = row.get(field)
    if not isinstance(values, list) or any(not isinstance(v, str) or not v for v in values):
        raise ValueError(f'{row["id"]}: {field} must be a list of nonempty strings')
    if len(values) != len(set(values)):
        raise ValueError(f'{row["id"]}: duplicate {field}')
    return values


def evaluate(cases, results, k=3):
    if isinstance(k, bool) or not isinstance(k, int) or k < 1:
        raise ValueError('k must be a positive integer')
    expected, actual = indexed(cases, 'cases'), indexed(results, 'results')
    if expected.keys() != actual.keys():
        raise ValueError(f'case ID mismatch: missing={sorted(expected.keys()-actual.keys())}, extra={sorted(actual.keys()-expected.keys())}')
    rows = []
    for key, case in expected.items():
        run = actual[key]
        relevant, allowed = set(ids(case, 'relevant_ids')), set(ids(case, 'allowed_ids'))
        retrieved, citations = ids(run, 'retrieved_ids'), ids(run, 'citation_ids')
        if not relevant <= allowed:
            raise ValueError(f'{key}: relevant documents must be allowed')
        abstain = run.get('abstained')
        must_abstain = case.get('must_abstain')
        if type(abstain) is not bool or type(must_abstain) is not bool:
            raise ValueError(f'{key}: abstention fields must be booleans')
        if must_abstain == bool(relevant):
            raise ValueError(f'{key}: abstention cases must have no relevant IDs; answerable cases need relevant IDs')
        top = retrieved[:k]
        recall = len(relevant.intersection(top)) / len(relevant) if relevant else None
        rr = next((1 / rank for rank, doc in enumerate(top, 1) if doc in relevant), 0.0) if relevant else None
        # Check ALL retrieved documents, not only top-k: leaked context already crossed the boundary.
        forbidden = sorted((set(retrieved) | set(citations)) - allowed)
        unsupported_citations = sorted(set(citations) - set(retrieved))
        checks = {
            'full_recall_at_k': recall is None or recall == 1.0,
            'access_boundary': not forbidden,
            'citation_ids_retrieved': not unsupported_citations,
            'abstention_matches': abstain == must_abstain,
            'answer_has_citation': abstain or bool(citations),
            'abstention_has_no_citations': not abstain or not citations,
        }
        rows.append({'id': key, 'recall_at_k': recall, 'reciprocal_rank_at_k': rr,
                     'forbidden_ids': forbidden, 'unretrieved_citation_ids': unsupported_citations,
                     'checks': checks, 'passed': all(checks.values())})
    answerable = [row for row in rows if row['recall_at_k'] is not None]
    return {'k': k, 'cases': len(rows), 'answerable_cases': len(answerable),
            'mean_recall_at_k': sum(r['recall_at_k'] for r in answerable) / len(answerable) if answerable else None,
            'mrr_at_k': sum(r['reciprocal_rank_at_k'] for r in answerable) / len(answerable) if answerable else None,
            'access_failure_cases': sum(not r['checks']['access_boundary'] for r in rows),
            'passed_cases': sum(r['passed'] for r in rows), 'passed': all(r['passed'] for r in rows), 'results': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('cases', type=Path)
    parser.add_argument('results', type=Path)
    parser.add_argument('--k', type=int, default=3)
    args = parser.parse_args()
    try:
        report = evaluate(json.loads(args.cases.read_text()), json.loads(args.results.read_text()), args.k)
    except (ValueError, OSError) as exc:
        print(f'Invalid input: {exc}', file=sys.stderr)
        return 2
    print(json.dumps(report, indent=2))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
