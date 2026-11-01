import importlib.util
from pathlib import Path
from datetime import date
import json
import unittest

ROOT = Path(__file__).parent

def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded

weekly = module('weekly', 'seo-weekly-report.py')
status = module('status', 'enquiry-status.py')

class LeadReportingTests(unittest.TestCase):
    def test_sources_and_manual_qualification_are_separate(self):
        row = {key: {'S': value} for key, value in dict(id='enquiry:example', received_at='2026-11-01T12:00:00Z', source_path='/contact', landing_path='/notes/rag-for-sql', discovery_source='github', visit_source='google_search', attribution_basis='consented_browser_hint_v1', lead_status='qualified').items()}
        report = weekly.count_enquiries([row, row], date(2026,11,1), date(2026,11,1))
        self.assertEqual(report['total'], 1)
        self.assertEqual(report['by_discovery_source'], {'github':1})
        self.assertEqual(report['qualified_by_visit_source'], {'google_search':1})
        row['lead_status']['S'] = 'spam_test'
        self.assertEqual(weekly.count_enquiries([row],date(2026,11,1),date(2026,11,1))['qualified_by_visit_source'], {})
        row['landing_path']['S'] = '/contact?email=private'
        self.assertNotIn('private', json.dumps(weekly.count_enquiries([row],date(2026,11,1),date(2026,11,1))))
        del row['attribution_basis']
        self.assertEqual(weekly.count_enquiries([row],date(2026,11,1),date(2026,11,1))['by_visit_source'], {'unavailable':1})

    def test_status_write_requires_existing_record_and_expected_state(self):
        receipt = 'd9a494e4-b663-42d2-9a60-f62727096535'
        command = status.update_command(receipt,'qualified','new','mine')
        self.assertIn('attribute_exists(id) AND lead_status = :expected',command)
        self.assertEqual(json.loads(command[command.index('--expression-attribute-values')+1])[':expected'], {'S':'new'})
        legacy = status.update_command(receipt,'spam_test','unreviewed','mine')
        self.assertIn('attribute_exists(id) AND attribute_not_exists(lead_status)',legacy)
        with self.assertRaises(ValueError): status.update_command('invalid','qualified','new','mine')
        with self.assertRaises(ValueError): status.update_command(receipt,'invented','new','mine')

if __name__ == '__main__': unittest.main()
