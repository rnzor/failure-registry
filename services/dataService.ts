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

    return response.data.map((apiFailure: ApiFailure) => {
      // Extract company names from title using separators
      let companies: string[] = [];
      if (apiFailure.title) {
        const separators = [' — ', ' - ', ': ', ' – '];
        for (const separator of separators) {
          if (apiFailure.title.includes(separator)) {
            companies = [apiFailure.title.split(separator)[0].trim()];
            break;
          }
        }
        // Fallback: First word if it looks like a Proper Noun
        if (companies.length === 0) {
          const firstWord = apiFailure.title.split(' ')[0];
          if (firstWord && /^[A-Z]/.test(firstWord) && firstWord.length > 2) {
            companies = [firstWord];
          }
        }
      }

      // Map API object to our clean Internal Interface
      return {
        id: apiFailure.id,
        title: apiFailure.title,
        year: apiFailure.year,
        category: apiFailure.category as Category,
        cause: apiFailure.cause as Cause,
        severity: apiFailure.severity as SeverityObject,
        summary: apiFailure.summary,
        stage: apiFailure.stage as Stage,
        impact: apiFailure.impact || [],
        root_cause: apiFailure.root_cause,
        lessons: apiFailure.lessons || [],
        patterns: apiFailure.patterns || [],
        tags: apiFailure.tags || [],
        sources: apiFailure.sources as Source[],
        evidence_type: apiFailure.evidence_type as EvidenceType,
        companies // UI specific
      };
    });
  } catch (error) {
    console.error("Failed to load data from API:", error);
    throw error;
  }
};