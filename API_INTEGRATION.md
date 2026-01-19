# API Integration Guide

This document explains how to integrate with the Awesome Tech Failures API.

---

## Base URLs

| Environment | Base URL | Description |
|-------------|-----------|-------------|
| Production | `https://rnzor.github.io/awesome-tech-failures/api/v1` | GitHub Pages static API v1 |
| Development | `http://localhost:3000/api/v1` | Local development path (via Vite proxy) |

---

## Environment Configuration

### Required Variables

Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=https://rnzor.github.io/awesome-tech-failures/api/v1
```

### Optional Variables

```env
# OpenAI API Key for custom embedding queries (not stored, used only in memory)
VITE_OPENAI_API_KEY=

# Set to 'true' to force development mode
VITE_DEV_MODE=false
```

---

## API Endpoints

### GET /failures
List all failure entries.

**Request:**
```typescript
const response = await fetch(`${VITE_API_BASE_URL}/failures.json`);
const data = await response.json();
```

**Response:**
```typescript
interface FailuresResponse {
  total: number;
  data: Failure[];
}

interface Failure {
  id: string;
  title: string;
  date: string;
  category: 'ai-slop' | 'outage' | 'security' | 'startup' | 'product' | 'decision';
  severity: 'critical' | 'high' | 'medium' | 'low';
  companies: string[];
  description: string;
  impact?: string;
  tags: string[];
  links: Link[];
}

interface Link {
  title: string;
  url: string;
  type: 'post-mortem' | 'news' | 'github' | 'social';
}
```

---

### GET /failures/{id}
Get a specific failure entry.

**Request:**
```typescript
const response = await fetch(`${VITE_API_BASE_URL}/failures.json`);
const data = await response.json();
const failure = data.find((f: any) => f.id === 'aws-s3-us-east-1-2017');
```

---

### GET /embeddings.json
Load pre-computed embeddings for similarity search.

**Note:** File size is ~256KB, load time is <100ms on modern browsers.

```typescript
const embeddings = await fetch(`${VITE_API_BASE_URL}/embeddings.json`);
const data = await embeddings.json();
```

---

### GET /hybrid_lookup.json
Load pre-embedded terms for instant similarity lookup without API calls.

```typescript
const lookup = await fetch(`${VITE_API_BASE_URL}/hybrid_lookup.json`);
const data = await lookup.json();
```

---

## Semantic Search (Similarity Search)

### Overview

The app includes a hybrid semantic search feature that uses pre-computed embeddings to find similar failures based on meaning rather than just keyword matching.

### How It Works

1. **Hybrid Lookup (Default)**: Uses pre-embedded common terms for instant searches
2. **Custom Embeddings**: If a term isn't in the hybrid lookup, you can provide an OpenAI API key to generate embeddings on-the-fly

### Using the Search

**From the UI:**
1. Click "SEMANTIC" in the sidebar or use `Cmd+K` → "Semantic Search"
2. Enter your query (e.g., "database outage", "security breach")
3. Results show similarity scores

**Programmatically:**

```typescript
import { searchSimilarity } from './services/apiService';

const results = await searchSimilarity(
  'database outage',  // query
  10,                // top_k results
  undefined,         // filters (optional)
  true,              // useHybridOnly (true = no API key needed)
  undefined          // apiKey (optional, only if useHybridOnly = false)
);

console.log(results.map(r => ({
  id: r.id,
  score: r.similarity_score,
  title: r.entry?.title
})));
```

### Security Note

**Never store API keys in localStorage or cookies.** The implementation uses per-session memory input only, which is the recommended approach for public deployments.

---

## Vite Configuration

### Development Proxy

The `vite.config.ts` includes a proxy configuration for development:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://rnzor.github.io/awesome-tech-failures',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
```

This allows you to use `/api/v1/failures.json` in development, which proxies to the production API.

---

## Category Mapping

The API uses kebab-case category values. The frontend maps these to display names:

| API Value | Display Name |
|-----------|--------------|
| `ai-slop` | AI Slop |
| `outage` | Outage |
| `security` | Security |
| `startup` | Startup |
| `product` | Product |
| `hardware` | Hardware |

---

## Performance Considerations

### Embeddings Loading
- **File size**: ~256KB
- **Load time**: <100ms on modern browsers
- **Caching**: Embeddings are cached in memory after first load

### Similarity Calculation
- **Complexity**: `O(N * d)` where N = entry count, d = dimensions
- **Expected time**: <10ms for current dataset
- **Scales**: Linearly with entry count

### Hybrid Mode
- **Pre-embedded terms**: Instant (no network request)
- **Custom queries**: Requires OpenAI API call (100-500ms)

---

## Error Handling

The API service includes:
- **Automatic retry**: 3 retries with exponential backoff for network failures
- **User-friendly errors**: Clear error messages for common issues
- **Offline detection**: Network errors are caught and reported

```typescript
try {
  const data = await loadFailures();
} catch (error) {
  if (error.message.includes('fetch') || error.message.includes('network')) {
    console.log('Check your internet connection');
  } else {
    console.log('API error:', error.message);
  }
}
```

---

## TypeScript Types

Types are defined in `types/api.ts`:

```typescript
import { ApiCategory, ApiSeverity, ApiFailure, FailuresResponse } from './types/api';
```

---

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- NDJSON parsing
- Category enum values
- API type validation

---

## Troubleshooting

### API Not Loading
1. Check your internet connection
2. Verify `VITE_API_BASE_URL` is set correctly
3. Check browser console for error messages

### Semantic Search Not Working
1. If using hybrid mode, ensure the term is in the hybrid lookup
2. If using custom embeddings, provide a valid OpenAI API key
3. Check browser console for API errors

### Categories Not Displaying Correctly
Ensure the category mapping functions are being used in components (Sidebar, StatsDashboard).

---

## Support

For issues or questions:
- Check the [main repository](https://github.com/rnzor/awesome-tech-failures)
- Open an issue at: https://github.com/rnzor/awesome-tech-failures/issues
