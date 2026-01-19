import { describe, it, expect } from 'vitest';
import { parseNDJSON } from '../../services/dataService';

describe('parseNDJSON', () => {
  it('parses valid NDJSON string into FailureEntry array', () => {
    const ndjson = `{"id": "test-1", "title": "Test Failure", "year": 2024, "category": "outage", "cause": "human-error", "severity": {"level": "high", "score": 8}, "companies": ["TestCo"], "summary": "A test failure.", "impact": ["Minor impact."], "tags": ["test"], "sources": [{"title": "Source", "url": "http://example.com", "kind": "primary"}]}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'test-1',
      title: 'Test Failure',
      year: 2024,
      category: 'outage',
      cause: 'human-error',
      severity: { level: 'high', score: 8 },
      companies: ['TestCo'],
      summary: 'A test failure.',
      impact: ['Minor impact.'],
      tags: ['test'],
      sources: [{ title: 'Source', url: 'http://example.com', kind: 'primary' }],
    });
  });

  it('adds ID if missing from entry', () => {
    const ndjson = `{"title": "No ID Failure", "year": 2024, "category": "startup", "cause": "no-pmf", "severity": {"level": "low"}, "companies": ["NoIdCo"], "summary": "Missing ID."}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(1);
    expect(result[0].id).toMatch(/^entry-\d+-\d+$/);
  });

  it('handles multiple lines', () => {
    const ndjson = `{"id": "test-1", "title": "First", "year": 2024, "category": "outage", "cause": "automation", "severity": {"level": "high"}, "companies": ["A"], "summary": "First failure."}
{"id": "test-2", "title": "Second", "year": 2024, "category": "security", "cause": "platform-risk", "severity": {"level": "critical"}, "companies": ["B"], "summary": "Second failure."}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('First');
    expect(result[1].title).toBe('Second');
  });

  it('skips malformed JSON lines', () => {
    const ndjson = `{"id": "valid", "title": "Valid Entry", "year": 2024, "category": "startup", "cause": "no-pmf", "severity": {"level": "high"}, "companies": ["Valid"], "summary": "Valid."}
invalid json line
{"id": "another-valid", "title": "Another Valid", "year": 2024, "category": "security", "cause": "platform-risk", "severity": {"level": "low"}, "companies": ["Valid"], "summary": "Valid."}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('valid');
    expect(result[1].id).toBe('another-valid');
  });

  it('returns empty array for empty input', () => {
    const result = parseNDJSON('');
    expect(result).toHaveLength(0);
  });
});

describe('Category validity', () => {
  it('should accept valid category strings', () => {
    const validCategories = ['ai-slop', 'outage', 'security', 'startup', 'product', 'decision'];
    validCategories.forEach(cat => {
      const ndjson = `{"id": "test-${cat}", "title": "Test", "year": 2024, "category": "${cat}", "cause": "human-error", "severity": {"level": "low"}, "companies": ["Test"], "summary": "Test"}`;
      const result = parseNDJSON(ndjson);
      expect(result[0].category).toBe(cat);
    });
  });
});