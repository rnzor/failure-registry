import { describe, it, expect } from 'vitest';
import { parseNDJSON } from '../../services/dataService';
import { FailureEntry } from '../../types';

describe('parseNDJSON', () => {
  it('parses valid NDJSON string into FailureEntry array', () => {
    const ndjson = `{"id": "test-1", "title": "Test Failure", "date": "2024-01-01", "category": "Production Outage", "severity": "High", "companies": ["TestCo"], "description": "A test failure.", "impact": "Minor impact.", "tags": ["test"], "links": [{"title": "Link", "url": "http://example.com", "type": "news"}]}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'test-1',
      title: 'Test Failure',
      date: '2024-01-01',
      category: 'Production Outage',
      severity: 'High',
      companies: ['TestCo'],
      description: 'A test failure.',
      impact: 'Minor impact.',
      tags: ['test'],
      links: [{ title: 'Link', url: 'http://example.com', type: 'news' }],
    });
  });

  it('adds ID if missing from entry', () => {
    const ndjson = `{"title": "No ID Failure", "date": "2024-01-01", "category": "Startup Failure", "severity": "Low", "companies": ["NoIdCo"], "description": "Missing ID.", "impact": "No impact.", "tags": [], "links": []}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(1);
    expect(result[0].id).toMatch(/^entry-\d+-\d+$/); // Generated ID pattern
  });

  it('handles multiple lines', () => {
    const ndjson = `{"id": "test-1", "title": "First", "date": "2024-01-01", "category": "Outage", "severity": "High", "companies": ["A"], "description": "First failure.", "impact": "Impact 1.", "tags": [], "links": []}
{"id": "test-2", "title": "Second", "date": "2024-01-02", "category": "Security", "severity": "Critical", "companies": ["B"], "description": "Second failure.", "impact": "Impact 2.", "tags": [], "links": []}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('First');
    expect(result[1].title).toBe('Second');
  });

  it('skips malformed JSON lines', () => {
    const ndjson = `{"id": "valid", "title": "Valid Entry", "date": "2024-01-01", "category": "Valid", "severity": "High", "companies": ["Valid"], "description": "Valid.", "impact": "Valid.", "tags": [], "links": []}
invalid json line
{"id": "another-valid", "title": "Another Valid", "date": "2024-01-02", "category": "Valid", "severity": "Low", "companies": ["Valid"], "description": "Valid.", "impact": "Valid.", "tags": [], "links": []}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('valid');
    expect(result[1].id).toBe('another-valid');
  });

  it('returns empty array for empty input', () => {
    const result = parseNDJSON('');
    expect(result).toHaveLength(0);
  });

  it('skips empty lines', () => {
    const ndjson = `{"id": "test", "title": "Test", "date": "2024-01-01", "category": "Test", "severity": "High", "companies": ["Test"], "description": "Test.", "impact": "Test.", "tags": [], "links": []}

{"id": "test2", "title": "Test2", "date": "2024-01-02", "category": "Test", "severity": "Low", "companies": ["Test"], "description": "Test.", "impact": "Test.", "tags": [], "links": []}`;

    const result = parseNDJSON(ndjson);

    expect(result).toHaveLength(2);
  });
});