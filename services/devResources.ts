export const API_SPEC_MOCK = {
  openapi: "3.0.0",
  info: {
    title: "Awesome Tech Failures API",
    version: "1.0.0",
    description: "Programmatic access to the failure index for AI agents and RAG pipelines."
  },
  servers: [
    { url: "https://rnzor.github.io/awesome-tech-failures/api/v1" }
  ],
  paths: [
    {
      path: "/failures",
      method: "GET",
      summary: "List failure entries",
      description: "Retrieve a paginated list of tech failures with optional filtering (JSON).",
      params: [
        { name: "category", type: "'ai-slop' | 'outage' | 'security'...", in: "query", required: false, desc: "Filter by category" },
        { name: "tags", type: "string[]", in: "query", required: false, desc: "Filter by specific tags" },
        { name: "limit", type: "number", in: "query", required: false, desc: "Max results" },
        { name: "offset", type: "number", in: "query", required: false, desc: "Pagination offset" }
      ],
      body: null
    },
    {
      path: "/failures/{id}",
      method: "GET",
      summary: "Get failure details",
      description: "Retrieve full post-mortem details for a specific ID.",
      params: [
        { name: "id", type: "string", in: "path", required: true, desc: "e.g., 'aws-s3-us-east-1-2017'" }
      ],
      body: null
    },
    {
      path: "clientSearchSimilarity()",
      method: "CLIENT",
      summary: "Client-Side Semantic Search",
      description: "IMPORTANT: This is a client-side function, not a network endpoint. Performs cosine similarity search against pre-computed embeddings.",
      params: [
        { name: "query", type: "string", in: "arg", required: true, desc: "Search query" },
        { name: "top_k", type: "number", in: "arg", required: false, desc: "Default: 5" },
        { name: "filters", type: "object", in: "arg", required: false, desc: "{ category, severity, tags }" },
        { name: "apiKey", type: "string", in: "arg", required: false, desc: "For hybrid fallback (OpenAI)" }
      ],
      implementation: true,
      body: { query: "string", top_k: 5 }
    }
  ]
};

export const CLIENT_SEARCH_IMPL = `// 1. Load embeddings once on app mount
let embeddingsCache: Embedding[] | null = null;
async function loadEmbeddings() {
  if (!embeddingsCache) {
    const response = await fetch('https://rnzor.github.io/awesome-tech-failures/api/v1/embeddings.json');
    const data = await response.json();
    embeddingsCache = data;
  }
  return embeddingsCache;
}

// 2. Load hybrid lookup for pre-embedded terms
let hybridLookupCache: Record<string, number[]> | null = null;
async function loadHybridLookup() {
  if (!hybridLookupCache) {
    const response = await fetch('https://rnzor.github.io/awesome-tech-failures/api/v1/hybrid_lookup.json');
    const data = await response.json();
    hybridLookupCache = data.terms;
  }
  return hybridLookupCache;
}

// 3. Cosine similarity function
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dot = 0, norm1 = 0, norm2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// 4. Get query embedding (hybrid approach)
async function getQueryEmbedding(query: string, options: { apiKey?: string, useHybridOnly?: boolean } = {}): Promise<number[]> {
  const { apiKey, useHybridOnly = true } = options;
  const hybridLookup = await loadHybridLookup();
  
  if (hybridLookup[query]) {
    console.log('Using pre-embedded term');
    return hybridLookup[query].vector;
  }
  
  if (apiKey && !useHybridOnly) {
    console.log('Using embedding API for custom query');
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${apiKey}\` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: query })
    });
    if (!response.ok) throw new Error('Embedding API failed');
    const data = await response.json();
    return data.data[0].embedding;
  }
  throw new Error('NO_EMBEDDING_AVAILABLE');
}

// 5. Similarity search function
async function searchSimilarity(query: string, topK: number = 5, filters?: SearchFilters, useHybridOnly: boolean = true, apiKey?: string) {
  const embeddings = await loadEmbeddings();
  const queryVector = await getQueryEmbedding(query, { apiKey, useHybridOnly });
  
  return embeddings
    .filter(emb => applyFilters(emb, filters))
    .map(emb => ({ ...emb, similarity_score: cosineSimilarity(queryVector, emb.vector) }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, topK);
}
`;

export const RAG_GUIDE_CODE = `import os
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings

# 1. Initialize Embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# 2. Connect to the Failure Index Vector Store (Mock)
# In reality, you'd pull failures.json and ingest into local vector store or use the client wrapper.
print("Fetching failures from https://rnzor.github.io/awesome-tech-failures/api/v1/failures.json")
`;
