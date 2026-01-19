import { Embedding, SimilarityResult } from '../types/api';

const BASE_URL = 'https://rnzor.github.io/awesome-tech-failures/api/v1';

let embeddingsCache: Embedding[] | null = null;
let hybridLookupCache: Record<string, { vector: number[] }> | null = null;

export async function loadEmbeddings(): Promise<Embedding[]> {
    if (!embeddingsCache) {
        try {
            const response = await fetch(`${BASE_URL}/embeddings.json`);
            if (!response.ok) throw new Error('Failed to load embeddings');
            const data = await response.json();
            embeddingsCache = data;
        } catch (error) {
            console.error('Error loading embeddings:', error);
            return [];
        }
    }
    return embeddingsCache || [];
}

export async function loadHybridLookup(): Promise<Record<string, { vector: number[] }>> {
    if (!hybridLookupCache) {
        try {
            const response = await fetch(`${BASE_URL}/hybrid_lookup.json`);
            if (!response.ok) throw new Error('Failed to load hybrid lookup');
            const data = await response.json();
            hybridLookupCache = data.terms || {};
        } catch (error) {
            console.error('Error loading hybrid lookup:', error);
            return {};
        }
    }
    return hybridLookupCache || {};
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    let dot = 0, norm1 = 0, norm2 = 0;
    for (let i = 0; i < vec1.length; i++) {
        dot += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dot / denominator;
}

export async function getQueryEmbedding(
    query: string,
    options: { apiKey?: string, useHybridOnly?: boolean } = {}
): Promise<number[]> {
    const { apiKey, useHybridOnly = true } = options;
    const hybridLookup = await loadHybridLookup();

    const normalizedQuery = query.toLowerCase().trim();

    if (hybridLookup[normalizedQuery]) {
        console.log('[SimilarityService] Using pre-embedded term for:', normalizedQuery);
        return hybridLookup[normalizedQuery].vector;
    }

    if (apiKey && !useHybridOnly) {
        console.log('[SimilarityService] Requesting OpenAI embedding for:', normalizedQuery);
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: normalizedQuery
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || 'Embedding API failed');
        }

        const data = await response.json();
        return data.data[0].embedding;
    }

    throw new Error('NO_EMBEDDING_AVAILABLE');
}

export interface SearchFilters {
    category?: string;
    tags?: string[];
}

export async function searchSimilarity(
    query: string,
    topK: number = 5,
    filters?: SearchFilters,
    useHybridOnly: boolean = true,
    apiKey?: string
): Promise<SimilarityResult[]> {
    const embeddings = await loadEmbeddings();
    const queryVector = await getQueryEmbedding(query, { apiKey, useHybridOnly });

    return embeddings
        .filter(emb => {
            if (!filters) return true;
            if (filters.category && emb.category !== filters.category) return false;
            if (filters.tags && filters.tags.length > 0) {
                const embTags = emb.tags || [];
                if (!filters.tags.every(t => embTags.includes(t))) return false;
            }
            return true;
        })
        .map(emb => ({
            ...emb,
            similarity_score: cosineSimilarity(queryVector, emb.vector)
        }))
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, topK);
}
