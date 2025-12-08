export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export enum AppStage {
  UPLOAD = 'UPLOAD',
  CLARIFICATION = 'CLARIFICATION',
  REPORT = 'REPORT'
}

export interface CloudComponent {
  service: string;
  type: string;
  count_estimate: string;
  notes: string;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  context: string;
}

export interface AnalysisResult {
  components: CloudComponent[];
  architecture_pattern: string;
  cloud_provider: string;
  observations: string[];
  questions: Question[];
}

export interface CostItem {
  service: string;
  configuration: string;
  monthly_cost: number;
  calculation_note: string;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  estimated_savings: string;
}

export interface CostReport {
  items: CostItem[];
  total_monthly_cost: number;
  total_yearly_cost: number;
  confidence_score: string;
  ranges: {
    optimistic: number;
    pessimistic: number;
  };
  executive_summary: string;
  recommendations: Recommendation[];
}
