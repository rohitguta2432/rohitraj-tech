#!/usr/bin/env python3
"""Review lead status without printing contact details. Writes require --apply."""
import argparse
from datetime import datetime, timezone
import json
import subprocess
from uuid import UUID

STATUSES = ('new', 'qualified', 'call_scheduled', 'won', 'not_fit', 'spam_test')


def update_command(receipt, status, expected, profile):
    receipt = str(UUID(receipt.removeprefix('enquiry:')))
    if status not in STATUSES or expected not in (*STATUSES, 'unreviewed'):
        raise ValueError('Unknown lead status')
    values = {':next': {'S': status}, ':time': {'S': datetime.now(timezone.utc).isoformat()}}
    condition = 'attribute_exists(id) AND attribute_not_exists(lead_status)'
    if expected != 'unreviewed':
        condition = 'attribute_exists(id) AND lead_status = :expected'
        values[':expected'] = {'S': expected}
    return ['aws', 'dynamodb', 'update-item', '--table-name', 'rohitraj-tech-enquiries',
            '--region', 'ap-south-1', '--profile', profile,
            '--key', json.dumps({'id': {'S': 'enquiry:' + receipt}}),
            '--update-expression', 'SET lead_status = :next, status_updated_at = :time',
            '--condition-expression', condition,
            '--expression-attribute-values', json.dumps(values), '--return-values', 'NONE']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('receipt', help='Receipt UUID from the existing enquiry notification')
    parser.add_argument('status', choices=STATUSES)
    parser.add_argument('--from-status', required=True, choices=(*STATUSES, 'unreviewed'))
    parser.add_argument('--aws-profile', default='mine')
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    command = update_command(args.receipt, args.status, args.from_status, args.aws_profile)
    print(json.dumps({'mode': 'apply' if args.apply else 'preview', 'from': args.from_status, 'to': args.status}))
    if not args.apply:
        print('No write made. Review the enquiry first; --apply performs this conditional status change.')
        return 0
    result = subprocess.run(command, capture_output=True, text=True, timeout=45)
    if result.returncode:
        print('Update failed. The receipt may be absent, its status may have changed, or AWS access may be unavailable. No new enquiry is created.')
        return 1
    print('Status updated. Contact details, TTL and notification state unchanged.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
