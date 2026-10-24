import { LearningGoal, Prediction, EvaluationOutcome } from './contract';

export type ScreenState = 'goal_selection' | 'workspace';

export interface WorkspaceSessionState {
  goal: LearningGoal;
  activeTaskId: string;
  userSql: string;
  prediction: Prediction | null;
  isEvaluating: boolean;
  evaluationOutcome: EvaluationOutcome | null;
  submittedSql: string | null;
  schemaPanelOpen: boolean;
  editorError: string | null;
}
