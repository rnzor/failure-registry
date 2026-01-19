import { FailureEntry, Category, Cause, Stage, EvidenceType, Source, SeverityObject } from '../types';
import { getFailures } from './apiService';
import { ApiFailure } from '../types/api';

/**
 * Parses raw NDJSON string into typed FailureEntry array.
 * This is the core logic requested for the "Data Utility".
 */
export const parseNDJSON = (ndjsonContent: string): FailureEntry[] => {
  if (!ndjsonContent) return [];

  return ndjsonContent
    .trim()
    .split('\n')
    .map((line, index) => {
      try {
        if (!line.trim()) return null;
        const parsed = JSON.parse(line);
        if (!parsed.id) {
          parsed.id = `entry-${index}-${Date.now()}`;
        }
        return parsed as FailureEntry;
      } catch (e) {
        console.error(`Failed to parse line ${index}:`, e);
        return null;
      }
    })
    .filter((entry): entry is FailureEntry => entry !== null);
};

async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

export const loadFailures = async (): Promise<FailureEntry[]> => {
  try {
    const response = await fetchWithRetry(() => getFailures());
    console.log("Data loaded from API.");

    return response.data.map((apiFailure: any) => {
      // Extract year from date string if year field is not present
      let year: number;
      if (apiFailure.year && typeof apiFailure.year === 'number') {
        year = apiFailure.year;
      } else if (apiFailure.date && typeof apiFailure.date === 'string') {
        year = parseInt(apiFailure.date.split('-')[0], 10) || 2020;
      } else {
        year = 2020;
      }

      // Use companies from API if present, otherwise extract from title
      let companies: string[] = apiFailure.companies || [];
      if (companies.length === 0 && apiFailure.title) {
        const separators = [' — ', ' - ', ': ', ' – '];
        for (const separator of separators) {
          if (apiFailure.title.includes(separator)) {
            companies = [apiFailure.title.split(separator)[0].trim()];
            break;
          }
        }
        if (companies.length === 0) {
          const firstWord = apiFailure.title.split(' ')[0];
          if (firstWord && /^[A-Z]/.test(firstWord) && firstWord.length > 2) {
            companies = [firstWord];
          }
        }
      }

      // Normalize severity to object format
      let severity: SeverityObject;
      if (typeof apiFailure.severity === 'string') {
        severity = { level: apiFailure.severity.toLowerCase() as any };
      } else if (apiFailure.severity && typeof apiFailure.severity === 'object') {
        severity = apiFailure.severity as SeverityObject;
      } else {
        severity = { level: 'medium' };
      }

      // Normalize category to new format
      const categoryMap: Record<string, Category> = {
        'Production Outage': 'outage',
        'AI Slop': 'ai-slop',
        'Security Incident': 'security',
        'Startup Failure': 'startup',
        'UX Disaster': 'product',
        'Hardware Failure': 'product',
        'Decision Failure': 'decision',
      };
      const category = categoryMap[apiFailure.category] || (apiFailure.category?.toLowerCase() as Category) || 'product';

      // Map API object to our clean Internal Interface
      return {
        id: apiFailure.id,
        title: apiFailure.title,
        year,
        category,
        cause: (apiFailure.cause as Cause) || 'human-error',
        severity,
        summary: apiFailure.summary || apiFailure.description || '',
        stage: apiFailure.stage as Stage,
        impact: Array.isArray(apiFailure.impact) ? apiFailure.impact : (apiFailure.impact ? [apiFailure.impact] : []),
        root_cause: apiFailure.root_cause,
        lessons: apiFailure.lessons || [],
        patterns: apiFailure.patterns || [],
        tags: apiFailure.tags || [],
        sources: apiFailure.sources as Source[],
        evidence_type: apiFailure.evidence_type as EvidenceType,
        companies
      };
    });
  } catch (error) {
    console.error("Failed to load data from API:", error);
    throw error;
  }
};