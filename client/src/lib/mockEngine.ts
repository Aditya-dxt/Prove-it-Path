import {
  EvaluationOutcome,
  Prediction,
  Task,
  RoadmapNode,
  TableCell
} from '../types/contract';
import { INITIAL_ROADMAP_NODES } from '../data/tasks';

export interface MockExecutionOptions {
  simulatedDelayMs?: number;
}

/**
 * DEVELOPMENT-ONLY MOCK ADAPTER
 * 
 * Note: This adapter provides deterministic fixture responses strictly for UI
 * development and presentation testing. It does NOT execute real SQL or evaluate
 * arbitrary queries. The authoritative engine will be provided by the backend teammate.
 */
export async function runMockEvaluation(
  task: Task,
  sql: string,
  prediction: Prediction,
  options: MockExecutionOptions = { simulatedDelayMs: 450 }
): Promise<EvaluationOutcome> {
  // Simulate network / evaluation delay
  if (options.simulatedDelayMs && options.simulatedDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, options.simulatedDelayMs));
  }

  const normalizedSql = sql.trim().toLowerCase().replace(/\s+/g, ' ');

  // 1. Syntax Error Simulation
  if (!normalizedSql || normalizedSql === 'select' || normalizedSql.includes('select from')) {
    return {
      state: 'slip',
      correct: false,
      actualColumns: [],
      actualRows: [],
      expectedColumns: ['name', 'department'],
      expectedRows: [
        ['Alice Chen', 'Engineering'],
        ['Bob Smith', 'Analytics'],
        ['Carol Danvers', 'Engineering'],
        ['David Miller', 'Marketing'],
        ['Elena Rostova', 'Analytics']
      ],
      diagnosis: '[Development Mock] SQL syntax error near "FROM": column projection is missing.',
      nextAction: 'Provide column names between SELECT and FROM.',
      errorMessage: 'SyntaxError: near "FROM": syntax error at or near keyword',
      roadmap: INITIAL_ROADMAP_NODES,
      remainingMinutes: 45
    };
  }

  // Expected target rows
  const expectedColumns = ['name', 'department'];
  const expectedRows: TableCell[][] = [
    ['Alice Chen', 'Engineering'],
    ['Bob Smith', 'Analytics'],
    ['Carol Danvers', 'Engineering'],
    ['David Miller', 'Marketing'],
    ['Elena Rostova', 'Analytics']
  ];

  // 2. Success Case: Learner correctly selected name and department
  const hasName = normalizedSql.includes('name');
  const hasDept = normalizedSql.includes('department');
  const isSelectAll = normalizedSql.includes('*');

  if (hasName && hasDept && !isSelectAll && normalizedSql.includes('employees')) {
    const updatedRoadmap: RoadmapNode[] = INITIAL_ROADMAP_NODES.map((node) =>
      node.id === task.nodeId ? { ...node, status: 'showed_once' } : node
    );

    return {
      state: prediction === 'can_do' ? 'proven' : 'hidden_strength',
      correct: true,
      actualColumns: expectedColumns,
      actualRows: expectedRows,
      expectedColumns,
      expectedRows,
      diagnosis:
        prediction === 'can_do'
          ? '[Development Mock] High confidence confirmed. Both requested columns (name, department) projected accurately.'
          : '[Development Mock] Hidden strength demonstrated. You were unsure, but your query produced the exact expected projection.',
      nextAction: 'Ready to proceed to node 02: WHERE clause filtering.',
      roadmap: updatedRoadmap,
      remainingMinutes: 38,
      errorMessage: null
    };
  }

  // 3. Mismatch Case: SELECT * or missing columns
  const actualColumns = isSelectAll
    ? ['id', 'name', 'department', 'salary', 'hire_date']
    : ['name'];

  const actualRows: TableCell[][] = isSelectAll
    ? [
        [1, 'Alice Chen', 'Engineering', 110000, '2022-03-15'],
        [2, 'Bob Smith', 'Analytics', 92000, '2021-07-01'],
        [3, 'Carol Danvers', 'Engineering', 125000, '2020-01-10'],
        [4, 'David Miller', 'Marketing', 85000, '2023-04-20'],
        [5, 'Elena Rostova', 'Analytics', 98000, '2022-11-05']
      ]
    : [
        ['Alice Chen'],
        ['Bob Smith'],
        ['Carol Danvers'],
        ['David Miller'],
        ['Elena Rostova']
      ];

  const state = prediction === 'can_do' ? 'mirage' : 'honest_gap';

  return {
    state,
    correct: false,
    actualColumns,
    actualRows,
    expectedColumns,
    expectedRows,
    diagnosis:
      state === 'mirage'
        ? '[Development Mock] Overconfidence gap (Mirage): You expected this query to work, but it projected extra or incorrect columns.'
        : '[Development Mock] Genuine gap (Honest Gap): The query does not match the expected projection for name and department.',
    nextAction: 'Review the schema panel and adjust column names after SELECT.',
    roadmap: INITIAL_ROADMAP_NODES,
    remainingMinutes: 45,
    errorMessage: null,
    contrastExample: task.contrastExample
  };
}
