export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface SeverityObject {
  level: SeverityLevel;
  score?: number;
  financial?: string;
}

export type Category = 'ai-slop' | 'outage' | 'security' | 'startup' | 'product' | 'decision';

export type Cause =
  | 'human-error' | 'automation' | 'architecture'
  | 'incentives' | 'ai' | 'timing' | 'ecosystem'
  | 'ux-mismatch' | 'platform-risk' | 'no-pmf'
  | 'deployment-validation' | 'latent-bug';

export type Stage = 'early' | 'growth' | 'scale' | 'decline';

export type EvidenceType = 'direct_incident' | 'repeated_pattern';

export interface Source {
  title: string;
  url: string;
  kind: 'primary' | 'secondary';
}

export interface FailureEntry {
  id: string;
  title: string;
  year: number;
  category: Category;
  cause: Cause;
  severity: SeverityObject;
  summary: string;
  // Optional but part of schema
  stage?: Stage;
  impact?: string[];
  root_cause?: string;
  lessons?: string[];
  patterns?: string[];
  tags?: string[];
  sources?: Source[];
  evidence_type?: EvidenceType;
  // UI specific (helper)
  companies: string[];
}