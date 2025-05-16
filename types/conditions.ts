export type Severity = 'low' | 'moderate' | 'high';

export interface FacialCondition {
  type: string;
  confidence: number;
  severity: Severity;
  affectedAreas: string[];
  relatedDoshas: string[];
}
