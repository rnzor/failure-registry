# Failure Registry 🛠️💥

_Formerly known as awesome-tech-failures-app_

> **BETA VERSION** - This is a beta release of the Awesome Tech Failures app. Features and UI may change.

A comprehensive registry of technology failures, outages, and incidents from across the industry. Learn from others' mistakes to build more resilient systems.

## Features

- 📊 **Extensive Registry**: Curated collection of major tech failures with detailed analysis
- 🎨 **Dual Theme**: Dark and light themes with improved accessibility
- 🔍 **Advanced Search**: Fuzzy search across titles, descriptions, companies, and tags
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🏷️ **Category Filtering**: Browse by failure type (Security, Outages, AI Slop, etc.)
- 📈 **Analytics Dashboard**: Statistical insights and trends
- 🤖 **AI Integration**: Coming soon - AI-powered failure analysis

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rnzor/awesome-tech-failures-app.git
   cd awesome-tech-failures-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## API Endpoints

### GET /failures
List all failure entries with optional filtering.

**Request:**
```typescript
interface GetFailuresParams {
  category?: 'ai-slop' | 'outage' | 'security' | 'startup' | 'product' | 'decision';
  tags?: string[];
  limit?: number;
  offset?: number;
}

const failures = await fetch('https://rnzor.github.io/awesome-tech-failures/api/v1/failures.json')
  .then(r => r.json());
```

**Response:**
```typescript
interface FailuresResponse {
  total: number;
  data: Failure[];
}
```

### GET /failures/{id}
Get specific failure entry.

**Request:**
```typescript
const failure = await fetch('https://rnzor.github.io/awesome-tech-failures/api/v1/failures.json')
  .then(r => r.json())
  .then(data => data.find(f => f.id === 'aws-s3-us-east-1-2017'));
```

### clientSearchSimilarity()
> **IMPORTANT:** This is a client-side function, not a network endpoint.

**Request Interface:**
```typescript
interface SimilaritySearchRequest {
  query: string;
  top_k?: number;
  filters?: {
    category?: string;
    severity?: string;
    tags?: string[];
  };
  use_hybrid_only?: boolean;
  embedding_api_key?: string;
}
```

**Implementation Steps:**

1. **Load embeddings once on app mount:**
```typescript
let embeddingsCache: Embedding[] | null = null;

async function loadEmbeddings() {
  if (!embeddingsCache) {
    const response = await fetch('https://rnzor.github.io/awesome-tech-failures/api/v1/embeddings.json');
    const data = await response.json();
    embeddingsCache = data;
  }
  return embeddingsCache;
}
```

2. **Load hybrid lookup for pre-embedded terms:**
```typescript
let hybridLookupCache: Record<string, number[]> | null = null;

async function loadHybridLookup() {
  if (!hybridLookupCache) {
    const response = await fetch('https://rnzor.github.io/awesome-tech-failures/api/v1/hybrid_lookup.json');
    const data = await response.json();
    hybridLookupCache = data.terms;
  }
  return hybridLookupCache;
}
```

3. **Cosine similarity function:**
```typescript
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dot = 0, norm1 = 0, norm2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
```

4. **Get query embedding (hybrid approach):**
```typescript
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query
      })
    });
    
    if (!response.ok) throw new Error('Embedding API failed');
    const data = await response.json();
    return data.data[0].embedding;
  }
  
  throw new Error('NO_EMBEDDING_AVAILABLE: Term not in hybrid lookup and no API key provided.');
}
```

5. **Similarity search function:**
```typescript
async function searchSimilarity(
  query: string,
  topK: number = 5,
  filters?: SearchFilters,
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
```

## Project Structure

```
src/
├── components/          # React components
│   ├── FailureCard.tsx  # Individual failure display
│   ├── Sidebar.tsx      # Navigation and filters
│   ├── StatsDashboard.tsx # Analytics view
│   └── ...
├── services/           # Data fetching and API services
├── types.ts           # TypeScript type definitions
└── App.tsx           # Main application component
```

## Contributing

This is currently a beta version. Found a bug or have suggestions?

- Report issues on [GitHub Issues](https://github.com/rnzor/awesome-tech-failures-app/issues)
- Submit pull requests for improvements

## License

MIT License - See LICENSE file for details
