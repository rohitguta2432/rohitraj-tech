import importlib.util
import json
from pathlib import Path
import unittest
from datetime import date
ROOT=Path(__file__).resolve().parents[1]
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,ROOT/path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
rag=module('rag','public/examples/rag-evaluation/evaluate.py')
cost=module('cost','public/examples/rag-cost/calculate.py')
weekly=module('weekly','scripts/seo-weekly-report.py')
sql=module('sql','public/examples/sql-acceptance/demo.py')

class SqlAcceptanceTests(unittest.TestCase):
 def setUp(self):
  self.db=sql.connect_fixture()
  self.addCleanup(self.db.close)
 def total(self,query='order_grain'):
  return self.db.execute(sql.QUERIES[query]).fetchone()[0]
 def test_recorded_result_and_intentional_failures(self):
  saved=json.loads((ROOT/'public/examples/sql-acceptance/result.json').read_text())
  self.assertEqual(sql.run_demo(),saved)
  self.assertEqual([self.total(name) for name in sql.QUERIES],[35000,15000,25000])
 def test_another_line_item_changes_wrong_total_only(self):
  self.db.execute('INSERT INTO order_items VALUES (9, 1)')
  self.assertEqual(self.total(),25000)
  self.assertEqual(self.total('duplicate_join'),45000)
 def test_equal_amount_orders_are_not_duplicates(self):
  self.db.execute("INSERT INTO orders VALUES (8, 10000, 'USD', 'paid', '2026-09-20T00:00:00Z')")
  self.db.execute('INSERT INTO order_items VALUES (9, 8)')
  self.assertEqual(self.total(),35000)
  self.assertEqual(self.total('distinct_amount'),15000)
 def test_period_status_and_currency_exclusions(self):
  for order_id in (4,5,6,7):
   with self.subTest(order_id=order_id):
    self.db.execute('UPDATE orders SET total_cents = 999999 WHERE id = ?', (order_id,))
    self.assertEqual(self.total(),25000)
 def test_lower_boundary_included_and_empty_total_defined(self):
  self.db.execute("UPDATE orders SET status = 'cancelled' WHERE id IN (2,3)")
  self.assertEqual(self.total(),10000)
  self.db.execute("UPDATE orders SET status = 'cancelled' WHERE id = 1")
  self.assertEqual(self.total(),0)

class RegressionTests(unittest.TestCase):
 def setUp(self):
  self.cases=json.loads((ROOT/'public/examples/rag-evaluation/cases.json').read_text())
  self.results=json.loads((ROOT/'public/examples/rag-evaluation/passing-results.json').read_text())
 def test_fixture_reports_reproduce(self):
  for kind in ('passing','failing'):
   inputs=json.loads((ROOT/f'public/examples/rag-evaluation/{kind}-results.json').read_text())
   saved=json.loads((ROOT/f'public/examples/rag-evaluation/{kind}-report.json').read_text())
   self.assertEqual(rag.evaluate(self.cases,inputs),saved)
 def test_missing_and_duplicate_cases_rejected(self):
  for rows in (self.results[:-1],self.results+[self.results[0]]):
   with self.assertRaises(ValueError): rag.evaluate(self.cases,rows)
 def test_leak_beyond_k_is_failure(self):
  self.results[0]['retrieved_ids']+=['shipping','forbidden']
  self.assertFalse(rag.evaluate(self.cases,self.results,k=1)['results'][0]['checks']['access_boundary'])
 def test_unknown_citation_and_false_boolean_rejected(self):
  self.results[0]['citation_ids']=['shipping']
  self.assertFalse(rag.evaluate(self.cases,self.results)['passed'])
  self.results[0]['abstained']='false'
  with self.assertRaises(ValueError): rag.evaluate(self.cases,self.results)
 def test_zero_answerable_cases(self):
  self.assertIsNone(rag.evaluate([self.cases[3]],[self.results[3]])['mean_recall_at_k'])
 def test_budget_and_sensitivity(self):
  inputs=json.loads((ROOT/'public/examples/rag-cost/assumptions.json').read_text())
  self.assertEqual(cost.calculate(inputs),json.loads((ROOT/'public/examples/rag-cost/result.json').read_text()))
  inputs['monthly_queries']=100000
  self.assertEqual(cost.calculate(inputs)['monthly_with_contingency_usd'],1524.60)
  with self.assertRaises(ValueError):cost.calculate([])
  inputs['hourly_usd']=float('nan')
  with self.assertRaises(ValueError):cost.calculate(inputs)
 def test_weighted_position_and_missing(self):
  self.assertIsNone(weekly.aggregate([]))
  self.assertEqual(weekly.aggregate([dict(impressions=1,clicks=0,position=2),dict(impressions=9,clicks=1,position=12)])['position'],11)
 def test_enquiries_date_boundary_privacy_and_deduplication(self):
  row={'id':{'S':'enquiry:test'},'received_at':{'S':'2026-10-23T01:00:00Z'},'source_path':{'S':'/contact?email=private'}}
  self.assertEqual(weekly.count_enquiries([row,row],date(2026,10,22),date(2026,10,22)),{'total':1,'by_form_page':{'other':1}})
  self.assertEqual(weekly.count_enquiries([row],date(2026,10,23),date(2026,10,23))['total'],0)
if __name__=='__main__':unittest.main()
