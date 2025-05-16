export interface FacialCondition {
  type: string;
  severity: number;
  confidence: number;
  affectedAreas: string[];
  relatedDoshas: string[];
}

export interface ConditionDetection {
  conditions: FacialCondition[];
  timestamp: Date;
  imageId: string;
}
