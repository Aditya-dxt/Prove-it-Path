/**
 * SHARED CONTRACT: Prove-It Path
 * 
 * Shared between Frontend, Engine, and Backend.
 * Do not rename or remove fields without cross-team consensus.
 */

export type Prediction = 'can_do' | 'not_sure';

export type LearnerState =
  | 'proven'          // High confidence, correct solution
  | 'hidden_strength' // Low confidence, but correct solution
  | 'honest_gap'      // Low confidence, incorrect solution (genuine knowledge gap)
  | 'mirage'          // High confidence, incorrect solution (overconfidence / misconception)
  | 'slip';           // Minor typo / syntax slip, not a conceptual misconception

export type RoadmapNodeStatus =
  | 'not_started'     // "Not started"
  | 'showed_once'     // "Showed it once" (Note: never displayed as "Mastered")
  | 'repaired'        // "Repaired"
  | 'recheck';        // "Re-check"

export interface ColumnSchema {
  name: string;
  type: string;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  sampleRows?: Record<string, string | number | boolean | null>[];
}

export interface ContrastExample {
  title?: string;
  description: string;
  sql: string;
  explanation: string;
}

export interface Task {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  schema: TableSchema[];
  starterSql: string;
  orderMatters: boolean;
  contrastExample?: ContrastExample;
  variantTaskId?: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  status: RoadmapNodeStatus;
  isRecheck?: boolean;
  estimatedMinutes?: number;
}

export type TableCell = string | number | boolean | null;

export interface EvaluationOutcome {
  state: LearnerState;
  correct: boolean;
  actualColumns: string[];
  actualRows: TableCell[][];
  expectedColumns: string[];
  expectedRows: TableCell[][];
  diagnosis: string;
  nextAction: string;
  roadmap: RoadmapNode[];
  remainingMinutes: number;
  errorMessage?: string | null;
  contrastExample?: ContrastExample;
}

export interface AIExplanationResponse {
  text: string;
  source: 'ai' | 'template';
  fallbackUsed: boolean;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export type Goal = LearningGoal;
