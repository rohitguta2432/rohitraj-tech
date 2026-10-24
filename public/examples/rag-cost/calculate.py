#!/usr/bin/env python3
"""Editable planning arithmetic, not a provider quote. Python 3.10+, stdlib only."""
import json
import math
import sys
from pathlib import Path

FIELDS = ('monthly_queries', 'generation_calls_per_query', 'input_tokens_per_call',
          'output_tokens_per_call', 'input_usd_per_million', 'output_usd_per_million',
          'monthly_embedding_tokens', 'embedding_usd_per_million', 'monthly_fixed_usd',
          'monthly_maintenance_hours', 'hourly_usd', 'implementation_hours', 'contingency_percent')


def calculate(inputs):
    if not isinstance(inputs, dict):
        raise ValueError('assumptions must be a JSON object')
    for name in FIELDS:
        value = inputs.get(name)
        if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
            raise ValueError(f'{name} must be a finite nonnegative number')
    calls = inputs['monthly_queries'] * inputs['generation_calls_per_query']
    generation = calls * (inputs['input_tokens_per_call'] * inputs['input_usd_per_million'] + inputs['output_tokens_per_call'] * inputs['output_usd_per_million']) / 1_000_000
    embedding = inputs['monthly_embedding_tokens'] * inputs['embedding_usd_per_million'] / 1_000_000
    maintenance = inputs['monthly_maintenance_hours'] * inputs['hourly_usd']
    implementation = inputs['implementation_hours'] * inputs['hourly_usd']
    recurring = generation + embedding + inputs['monthly_fixed_usd'] + maintenance
    return {k: round(v, 2) for k, v in {
        'monthly_generation_usd': generation, 'monthly_embeddings_usd': embedding,
        'monthly_fixed_usd': inputs['monthly_fixed_usd'], 'monthly_maintenance_usd': maintenance,
        'monthly_subtotal_usd': recurring,
        'monthly_with_contingency_usd': recurring * (1 + inputs['contingency_percent'] / 100),
        'implementation_before_contingency_usd': implementation,
        'implementation_with_contingency_usd': implementation * (1 + inputs['contingency_percent'] / 100),
    }.items()}


if __name__ == '__main__':
    try:
        print(json.dumps(calculate(json.loads(Path(sys.argv[1]).read_text())), indent=2))
    except (IndexError, ValueError, OSError) as exc:
        print(f'Usage: python3 calculate.py assumptions.json\nInvalid input: {exc}', file=sys.stderr)
        sys.exit(2)
