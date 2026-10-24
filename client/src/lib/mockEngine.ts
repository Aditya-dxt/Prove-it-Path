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
  options: MockExecutionOptions = { simulatedDelayMs: 450 },
  currentRoadmap: RoadmapNode[] = INITIAL_ROADMAP_NODES
): Promise<EvaluationOutcome> {
  // Simulate network / evaluation delay
  if (options.simulatedDelayMs && options.simulatedDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, options.simulatedDelayMs));
  }

  const normalizedSql = sql.trim().toLowerCase().replace(/\s+/g, ' ');

  // 1. Syntax Error Simulation (Slip)
  if (!normalizedSql || normalizedSql === 'select' || normalizedSql.includes('select from') || normalizedSql.includes('selec ')) {
    return {
      state: 'slip',
      correct: false,
      actualColumns: [],
      actualRows: [],
      expectedColumns: task.id === 'task-select-02' ? ['name', 'hire_date'] : ['name', 'department'],
      expectedRows: task.id === 'task-select-02'
        ? [
            ['Alice Chen', '2022-03-15'],
            ['Bob Smith', '2021-07-01'],
            ['Carol Danvers', '2020-01-10'],
            ['David Miller', '2023-04-20'],
            ['Elena Rostova', '2022-11-05']
          ]
        : [
            ['Alice Chen', 'Engineering'],
            ['Bob Smith', 'Analytics'],
            ['Carol Danvers', 'Engineering'],
            ['David Miller', 'Marketing'],
            ['Elena Rostova', 'Analytics']
          ],
      diagnosis: '[Development Mock] Syntax or query construction issue detected. The keyword order or column list appears incomplete.',
      nextAction: 'Review the SQL syntax in the editor and ensure valid column names are placed between SELECT and FROM.',
      errorMessage: 'SyntaxError: near "FROM": syntax error at or near keyword',
      roadmap: currentRoadmap,
      remainingMinutes: 45
    };
  }

  // --- Task 02: Variant Task (name, hire_date) ---
  if (task.id === 'task-select-02') {
    const expectedColumns = ['name', 'hire_date'];
    const expectedRows: TableCell[][] = [
      ['Alice Chen', '2022-03-15'],
      ['Bob Smith', '2021-07-01'],
      ['Carol Danvers', '2020-01-10'],
      ['David Miller', '2023-04-20'],
      ['Elena Rostova', '2022-11-05']
    ];

    const hasName = normalizedSql.includes('name');
    const hasHireDate = normalizedSql.includes('hire_date');
    const isSelectAll = normalizedSql.includes('*');

    if (hasName && hasHireDate && !isSelectAll && normalizedSql.includes('employees')) {
      // Mark re-check as repaired if it exists, otherwise showed_once
      const updatedRoadmap = currentRoadmap.map((node) => {
        if (node.isRecheck) {
          return { ...node, status: 'repaired' as const };
        }
        if (node.id === 'select') {
          return { ...node, status: 'showed_once' as const };
        }
        return node;
      });

      return {
        state: prediction === 'can_do' ? 'proven' : 'hidden_strength',
        correct: true,
        actualColumns: expectedColumns,
        actualRows: expectedRows,
        expectedColumns,
        expectedRows,
        diagnosis:
          prediction === 'can_do'
            ? '[Development Mock] Variant attempt verified. Correct projection (name, hire_date) demonstrated with high confidence.'
            : '[Development Mock] Variant attempt successful. You were unsure, but your column selection was exact.',
        nextAction: 'Re-check repair confirmed. Proceed to node 02: WHERE clause filtering.',
        roadmap: updatedRoadmap,
        remainingMinutes: 35,
        errorMessage: null
      };
    }

    // Task 02 mismatch
    const state = prediction === 'can_do' ? 'mirage' : 'honest_gap';
    return {
      state,
      correct: false,
      actualColumns: isSelectAll ? ['id', 'name', 'department', 'salary', 'hire_date'] : ['name'],
      actualRows: isSelectAll
        ? [
            [1, 'Alice Chen', 'Engineering', 110000, '2022-03-15'],
            [2, 'Bob Smith', 'Analytics', 92000, '2021-07-01'],
            [3, 'Carol Danvers', 'Engineering', 125000, '2020-01-10'],
            [4, 'David Miller', 'Marketing', 85000, '2023-04-20'],
            [5, 'Elena Rostova', 'Analytics', 98000, '2022-11-05']
          ]
        : [['Alice Chen'], ['Bob Smith'], ['Carol Danvers'], ['David Miller'], ['Elena Rostova']],
      expectedColumns,
      expectedRows,
      diagnosis:
        state === 'mirage'
          ? '[Development Mock] Overconfidence gap on variant task: Expected name and hire_date only.'
          : '[Development Mock] Projection mismatch on variant task.',
      nextAction: 'Ensure only name and hire_date are selected.',
      roadmap: currentRoadmap,
      remainingMinutes: 42,
      errorMessage: null,
      contrastExample: task.contrastExample
    };
  }

  // --- Task 01: Starter Task (name, department) ---
  const expectedColumns = ['name', 'department'];
  const expectedRows: TableCell[][] = [
    ['Alice Chen', 'Engineering'],
    ['Bob Smith', 'Analytics'],
    ['Carol Danvers', 'Engineering'],
    ['David Miller', 'Marketing'],
    ['Elena Rostova', 'Analytics']
  ];

  // Success Case
  const hasName = normalizedSql.includes('name');
  const hasDept = normalizedSql.includes('department');
  const isSelectAll = normalizedSql.includes('*');

  if (hasName && hasDept && !isSelectAll && normalizedSql.includes('employees')) {
    const updatedRoadmap: RoadmapNode[] = currentRoadmap.map((node) =>
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

  // Mismatch Case: SELECT * or missing department
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

  // If state is Mirage, engine inserts an adaptive Re-check node right after the failed node!
  let updatedRoadmap = [...currentRoadmap];
  let remainingMinutes = 45;

  if (state === 'mirage') {
    // Avoid duplicate recheck insertion
    const hasRecheckAlready = updatedRoadmap.some((n) => n.id === 'select-recheck');
    if (!hasRecheckAlready) {
      const selectIndex = updatedRoadmap.findIndex((n) => n.id === 'select');
      const insertPos = selectIndex >= 0 ? selectIndex + 1 : 1;
      const recheckNode: RoadmapNode = {
        id: 'select-recheck',
        label: 'SELECT (Re-check)',
        status: 'recheck',
        isRecheck: true,
        estimatedMinutes: 7
      };
      updatedRoadmap.splice(insertPos, 0, recheckNode);
    }
    // Estimated time increases because of inserted recheck
    remainingMinutes = 52;
  }

  return {
    state,
    correct: false,
    actualColumns,
    actualRows,
    expectedColumns,
    expectedRows,
    diagnosis:
      state === 'mirage'
        ? '[Development Mock] Overconfidence gap (Mirage): You predicted success, but the query produced all 5 columns instead of projecting only name and department. An adaptive Re-check step has been inserted into your roadmap.'
        : '[Development Mock] Genuine gap (Honest Gap): The query does not match the expected projection for name and department.',
    nextAction:
      state === 'mirage'
        ? 'Review the contrast example below, then test your understanding on the variant retry task.'
        : 'Review the schema panel and adjust column names after SELECT.',
    roadmap: updatedRoadmap,
    remainingMinutes,
    errorMessage: null,
    contrastExample: task.contrastExample
  };
}
