export interface ApiSource {
  title: string;
  url: string;
  kind: 'primary' | 'secondary';
}

export interface ApiSeverity {
  level: 'critical' | 'high' | 'medium' | 'low';
  score?: number;
  financial?: string;
}

export interface ApiFailure {
  id: string;
  title: string;
  year: number;
  category: 'ai-slop' | 'outage' | 'security' | 'startup' | 'product' | 'decision';
  cause: 'human-error' | 'automation' | 'architecture' | 'incentives' | 'ai' | 'timing' | 'ecosystem' | 'ux-mismatch' | 'platform-risk' | 'no-pmf' | 'deployment-validation' | 'latent-bug';
  severity: ApiSeverity;
  summary: string;
  stage?: 'early' | 'growth' | 'scale' | 'decline';
  impact?: string[];
  root_cause?: string;
  lessons?: string[];
  patterns?: string[];
  tags?: string[];
  sources?: ApiSource[];
  evidence_type?: 'direct_incident' | 'repeated_pattern';
}

export interface ApiPattern {
  id: string;
  title: string;
  description: string;
  common_tags: string[];
  related_categories: string[];
  examples: string[];
  playbooks?: string[];
}

export interface ApiTagTaxonomy {
  version: string;
  last_updated: string;
  description: string;
  tag_types: {
    category: Record<string, string>;
    cause: Record<string, string>;
    stage: Record<string, string>;
    impact: Record<string, string>;
  };
  free_tags: Array<{
    tag: string;
    category: string;
    description: string;
  }>;
}

export interface FailuresResponse {
  total: number;
  data: ApiFailure[];
}

export interface GetFailuresParams {
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface Embedding {
  id: string;
  vector: number[];
  category: string;
  severity: string;
  tags: string[];
}

export interface HybridLookupTerm {
  vector: number[];
}

export interface HybridLookup {
  terms: Record<string, HybridLookupTerm>;
}

export interface SimilaritySearchRequest {
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

export interface SimilarityResult extends Embedding {
  similarity_score: number;
}
