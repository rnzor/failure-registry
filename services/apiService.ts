import {
  FailuresResponse,
  GetFailuresParams,
  Embedding,
  HybridLookup,
  SimilarityResult,
  SimilaritySearchRequest,
  ApiPattern,
  ApiTagTaxonomy
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rnzor.github.io/awesome-tech-failures/api/v1';

let embeddingsCache: Embedding[] | null = null;
let hybridLookupCache: HybridLookup | null = null;

function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}/${endpoint}`;
}

export async function getFailures(params?: GetFailuresParams): Promise<FailuresResponse> {
  const url = getApiUrl('failures.json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch failures: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const failuresArray = Array.isArray(data) ? data : (data.data || []);

  if (params) {
    let filtered = failuresArray;

    if (params.category) {
      filtered = filtered.filter((f: any) => f.category === params.category);
    }

    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter((f: any) =>
        params.tags!.some(tag => f.tags.includes(tag))
      );
    }

    if (params.offset) {
      filtered = filtered.slice(params.offset);
    }

    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return {
      total: filtered.length,
      data: filtered
    };
  }

  return {
    total: failuresArray.length,
    data: failuresArray
  };
}

export async function getFailureById(id: string): Promise<any> {
  const response = await getFailures();
  return response.data.find((f: any) => f.id === id);
}

export async function loadEmbeddings(): Promise<Embedding[]> {
  if (embeddingsCache) {
    return embeddingsCache;
  }

  const url = getApiUrl('embeddings.json');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load embeddings: ${response.status} ${response.statusText}`);
  }

  embeddingsCache = await response.json();
  return embeddingsCache;
}

export async function loadHybridLookup(): Promise<HybridLookup> {
  if (hybridLookupCache) {
    return hybridLookupCache;
  }

  const url = getApiUrl('hybrid_lookup.json');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load hybrid lookup: ${response.status} ${response.statusText}`);
  }

  hybridLookupCache = await response.json();
  return hybridLookupCache;
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dot = 0, norm1 = 0, norm2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

async function getQueryEmbedding(
  query: string,
  options: { apiKey?: string, useHybridOnly?: boolean } = {}
): Promise<number[]> {
  const { apiKey, useHybridOnly = true } = options;
  const hybridLookup = await loadHybridLookup();

  const lowerQuery = query.toLowerCase().trim();

  if (hybridLookup.terms[lowerQuery]) {
    return hybridLookup.terms[lowerQuery].vector;
  }

  if (apiKey && !useHybridOnly) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error fetching embedding from API:', error);
      throw error;
    }
  }

  throw new Error('NO_EMBEDDING_AVAILABLE: Term not in hybrid lookup and no API key provided.');
}

function applyFilters(embedding: Embedding, filters?: any): boolean {
  if (!filters) return true;

  if (filters.category && embedding.category !== filters.category) {
    return false;
  }

  if (filters.severity && embedding.severity !== filters.severity) {
    return false;
  }

  if (filters.tags && filters.tags.length > 0) {
    const hasTag = filters.tags.some((tag: string) => embedding.tags.includes(tag));
    if (!hasTag) return false;
  }

  return true;
}

export async function searchSimilarity(
  query: string,
  topK: number = 5,
  filters?: any,
  useHybridOnly: boolean = true,
  apiKey?: string
): Promise<SimilarityResult[]> {
  const embeddings = await loadEmbeddings();
  const queryVector = await getQueryEmbedding(query, { apiKey, useHybridOnly });

  const results = embeddings
    .filter(emb => applyFilters(emb, filters))
    .map(emb => ({
      ...emb,
      similarity_score: cosineSimilarity(queryVector, emb.vector)
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, topK);

  return results;
}

export async function getPatterns(): Promise<ApiPattern[]> {
  const url = getApiUrl('patterns.json');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch patterns: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function getTags(): Promise<ApiTagTaxonomy> {
  const url = getApiUrl('tags.json');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function searchSimilarityWithRequest(
  request: SimilaritySearchRequest
): Promise<SimilarityResult[]> {
  return searchSimilarity(
    request.query,
    request.top_k || 5,
    request.filters,
    request.use_hybrid_only !== false,
    request.embedding_api_key
  );
}
