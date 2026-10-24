import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

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

export interface TaskDefinition {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  schema: TableSchema[];
  starterSql: string;
  referenceSql: string;
  orderMatters: boolean;
  contrastExample?: ContrastExample;
  variantTaskId?: string;
}

export type TableCell = string | number | boolean | null;

export interface RoadmapNode {
  id: string;
  label: string;
  status: 'not_started' | 'showed_once' | 'repaired' | 'recheck';
  isRecheck?: boolean;
  estimatedMinutes?: number;
}

export interface EvaluationOutcome {
  state: 'proven' | 'hidden_strength' | 'honest_gap' | 'mirage' | 'slip';
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

// ─── Fixture Schema & Seed Data ──────────────────────────────────────

export const FIXTURE_SCHEMA_SQL = `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary INTEGER NOT NULL,
  hire_date DATE NOT NULL
);

CREATE TABLE departments (
  name TEXT PRIMARY KEY,
  building TEXT NOT NULL,
  floor INTEGER NOT NULL
);

INSERT INTO employees VALUES
  (1, 'Alice Chen', 'Engineering', 110000, '2022-03-15'),
  (2, 'Bob Smith', 'Analytics', 92000, '2021-07-01'),
  (3, 'Carol Danvers', 'Engineering', 125000, '2020-01-10'),
  (4, 'David Miller', 'Marketing', 85000, '2023-04-20'),
  (5, 'Elena Rostova', 'Analytics', 98000, '2022-11-05');

INSERT INTO departments VALUES
  ('Engineering', 'Tech Tower', 4),
  ('Analytics', 'Main Building', 2),
  ('Marketing', 'Main Building', 1),
  ('Sales', 'East Wing', 3);
`;

// ─── Canonical Tasks ─────────────────────────────────────────────────

export const SERVER_TASKS: Record<string, TaskDefinition> = {
  'task-select-01': {
    id: 'task-select-01',
    nodeId: 'select',
    title: 'Find the employees',
    description: 'Return the names and departments of all employees in the provided dataset.',
    orderMatters: false,
    starterSql: '-- Return the name and department of all employees\nSELECT name, department\nFROM employees;',
    referenceSql: 'SELECT name, department FROM employees;',
    schema: [
      {
        tableName: 'employees',
        columns: [
          { name: 'id', type: 'INTEGER' },
          { name: 'name', type: 'TEXT' },
          { name: 'department', type: 'TEXT' },
          { name: 'salary', type: 'INTEGER' },
          { name: 'hire_date', type: 'DATE' },
        ],
      },
    ],
    contrastExample: {
      title: 'Projection vs Wildcard (SELECT * vs Specific Columns)',
      description: 'Selecting specific columns rather than using SELECT * to avoid unwanted payload.',
      sql: 'SELECT name, department FROM employees;',
      explanation:
        'A projection ensures only the requested columns (name, department) are returned. Using SELECT * returns all 5 columns (id, name, department, salary, hire_date), failing the required schema contract.',
    },
    variantTaskId: 'task-select-02',
  },

  'task-select-02': {
    id: 'task-select-02',
    nodeId: 'select',
    title: 'Employee Hire Dates (Variant Practice)',
    description: 'Return the name and hire_date for all employees in the dataset.',
    orderMatters: false,
    starterSql: '-- Return the name and hire_date of all employees\nSELECT name, hire_date\nFROM employees;',
    referenceSql: 'SELECT name, hire_date FROM employees;',
    schema: [
      {
        tableName: 'employees',
        columns: [
          { name: 'id', type: 'INTEGER' },
          { name: 'name', type: 'TEXT' },
          { name: 'department', type: 'TEXT' },
          { name: 'salary', type: 'INTEGER' },
          { name: 'hire_date', type: 'DATE' },
        ],
      },
    ],
    contrastExample: {
      title: 'Projection Consistency',
      description: 'Ensure exact column match for name and hire_date without extra fields.',
      sql: 'SELECT name, hire_date FROM employees;',
      explanation: 'Only the requested fields (name, hire_date) should be queried.',
    },
  },

  'task-where-01': {
    id: 'task-where-01',
    nodeId: 'where',
    title: 'High-earning Engineers',
    description: 'Return the name and salary of employees in Engineering earning more than 115000.',
    orderMatters: false,
    starterSql: 'SELECT name, salary FROM employees WHERE ',
    referenceSql: "SELECT name, salary FROM employees WHERE department = 'Engineering' AND salary > 115000;",
    schema: [],
    contrastExample: {
      title: 'Combining Conditions with AND',
      description: 'Use AND when both conditions must be true simultaneously.',
      sql: "SELECT name, salary FROM employees WHERE department = 'Engineering' AND salary > 115000;",
      explanation: 'AND requires both the department match and the salary threshold to be satisfied.',
    },
    variantTaskId: 'task-where-02',
  },

  'task-where-02': {
    id: 'task-where-02',
    nodeId: 'where',
    title: 'Marketing or Moderate Earners (Variant)',
    description: 'Select name and department of employees who work in Marketing OR earn less than 90000.',
    orderMatters: false,
    starterSql: 'SELECT name, department FROM employees WHERE ',
    referenceSql: "SELECT name, department FROM employees WHERE department = 'Marketing' OR salary < 90000;",
    schema: [],
  },

  'task-orderby-01': {
    id: 'task-orderby-01',
    nodeId: 'orderby',
    title: 'Top 3 Highest Paid Employees',
    description: 'Return the name and salary of the top 3 highest-earning employees, ordered from highest to lowest salary.',
    orderMatters: true,
    starterSql: 'SELECT name, salary FROM employees ORDER BY ',
    referenceSql: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
    schema: [],
  },

  'task-groupby-01': {
    id: 'task-groupby-01',
    nodeId: 'groupby',
    title: 'Department Headcounts',
    description: 'Return each department and the count of employees in that department.',
    orderMatters: false,
    starterSql: 'SELECT department, COUNT(*) AS count FROM employees GROUP BY ',
    referenceSql: 'SELECT department, COUNT(*) AS count FROM employees GROUP BY department;',
    schema: [],
  },

  'task-join-01': {
    id: 'task-join-01',
    nodeId: 'join',
    title: 'Employee Office Locations',
    description: 'Return employee name and their department building by joining employees and departments.',
    orderMatters: false,
    starterSql: 'SELECT employees.name, departments.building FROM employees JOIN ',
    referenceSql: 'SELECT employees.name, departments.building FROM employees JOIN departments ON employees.department = departments.name;',
    schema: [],
  },
};

// ─── SQL Engine Singleton ────────────────────────────────────────────

let sqlJsInstance: initSqlJs.SqlJsStatic | null = null;

export async function getSqlJs(): Promise<initSqlJs.SqlJsStatic> {
  if (!sqlJsInstance) {
    sqlJsInstance = await initSqlJs();
  }
  return sqlJsInstance;
}

export async function createSeededDb(): Promise<Database> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();
  db.run(FIXTURE_SCHEMA_SQL);
  return db;
}

// ─── SQL Validation ──────────────────────────────────────────────────

const WRITE_REGEX = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|ATTACH|DETACH)\b/i;

export function validateSqlSafety(sql: string): { valid: boolean; error?: string } {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { valid: false, error: 'Query is empty.' };
  }

  // Disallow write/DDL keywords
  if (WRITE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Only read-only SELECT queries are permitted. Schema modifications or write queries are rejected.',
    };
  }

  // Reject multiple statements separated by semicolon
  const statements = trimmed
    .split(/;\s*(?=\S)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (statements.length > 1) {
    return { valid: false, error: 'Only a single SELECT statement is allowed at a time.' };
  }

  // Must begin with SELECT or WITH
  if (!/^\s*(SELECT|WITH)\b/i.test(trimmed)) {
    return { valid: false, error: 'Only SELECT statements are permitted.' };
  }

  return { valid: true };
}

// ─── Result Comparison ───────────────────────────────────────────────

function serializeRow(row: TableCell[]): string {
  return JSON.stringify(row.map((c) => (c === null || c === undefined ? null : c)));
}

export function compareResults(
  actualCols: string[],
  actualRows: TableCell[][],
  expectedCols: string[],
  expectedRows: TableCell[][],
  orderMatters: boolean
): { correct: boolean; columnsMatch: boolean; rowsMatch: boolean; diagnosis: string } {
  const normAct = actualCols.map((c) => c.toLowerCase());
  const normExp = expectedCols.map((c) => c.toLowerCase());

  const columnsMatch =
    actualCols.length === expectedCols.length &&
    normAct.every((c, i) => c === normExp[i]);

  if (!columnsMatch) {
    const isSameSet = [...normAct].sort().join(',') === [...normExp].sort().join(',');
    if (isSameSet) {
      return {
        correct: false,
        columnsMatch: false,
        rowsMatch: false,
        diagnosis: 'Columns are present but in the wrong order. Adjust column order in your SELECT clause.',
      };
    }
    return {
      correct: false,
      columnsMatch: false,
      rowsMatch: false,
      diagnosis: `Column mismatch. Expected [${expectedCols.join(', ')}], but got [${actualCols.join(', ')}].`,
    };
  }

  // Row comparison
  if (actualRows.length !== expectedRows.length) {
    return {
      correct: false,
      columnsMatch: true,
      rowsMatch: false,
      diagnosis: `Row count mismatch: expected ${expectedRows.length} row(s), but your query returned ${actualRows.length} row(s).`,
    };
  }

  if (orderMatters) {
    for (let i = 0; i < expectedRows.length; i++) {
      if (serializeRow(actualRows[i]) !== serializeRow(expectedRows[i])) {
        return {
          correct: false,
          columnsMatch: true,
          rowsMatch: false,
          diagnosis: `Row order or value mismatch at row ${i + 1}. Check your ORDER BY clause.`,
        };
      }
    }
    return { correct: true, columnsMatch: true, rowsMatch: true, diagnosis: 'Query matched expected results.' };
  }

  // Order does not matter: multiset comparison
  const actCounts = new Map<string, number>();
  const expCounts = new Map<string, number>();

  for (const r of actualRows) {
    const s = serializeRow(r);
    actCounts.set(s, (actCounts.get(s) ?? 0) + 1);
  }
  for (const r of expectedRows) {
    const s = serializeRow(r);
    expCounts.set(s, (expCounts.get(s) ?? 0) + 1);
  }

  for (const [key, count] of expCounts) {
    if ((actCounts.get(key) ?? 0) !== count) {
      return {
        correct: false,
        columnsMatch: true,
        rowsMatch: false,
        diagnosis: 'Row values do not match expected records. Compare actual vs expected outputs below.',
      };
    }
  }

  return { correct: true, columnsMatch: true, rowsMatch: true, diagnosis: 'Query executed successfully and returned the exact expected results.' };
}

// ─── Full Real Evaluation Pipeline ───────────────────────────────────

export async function evaluateSqlAttempt(
  taskId: string,
  userSql: string,
  prediction: 'can_do' | 'not_sure',
  currentRoadmap?: RoadmapNode[]
): Promise<EvaluationOutcome> {
  const task = SERVER_TASKS[taskId] || SERVER_TASKS['task-select-01'];
  const roadmap = currentRoadmap ?? [
    { id: 'select', label: 'SELECT', status: 'not_started' },
    { id: 'where', label: 'WHERE — AND / OR', status: 'not_started' },
    { id: 'orderby', label: 'ORDER BY — LIMIT', status: 'not_started' },
    { id: 'groupby', label: 'GROUP BY — COUNT', status: 'not_started' },
    { id: 'join', label: 'JOIN', status: 'not_started' },
  ];

  // 1. Safety check
  const safety = validateSqlSafety(userSql);
  if (!safety.valid) {
    return {
      state: 'slip',
      correct: false,
      actualColumns: [],
      actualRows: [],
      expectedColumns: [],
      expectedRows: [],
      diagnosis: `Query rejected: ${safety.error}`,
      nextAction: 'Fix query syntax or remove unsupported write operations.',
      errorMessage: safety.error,
      roadmap,
      remainingMinutes: 45,
      contrastExample: task.contrastExample,
    };
  }

  let db: Database | null = null;
  try {
    db = await createSeededDb();

    // 2. Execute reference query to get expected results
    const expResult = db.exec(task.referenceSql);
    const expectedColumns = expResult.length > 0 ? expResult[0].columns : [];
    const expectedRows = expResult.length > 0 ? (expResult[0].values as TableCell[][]) : [];

    // 3. Execute user query
    let actResult;
    try {
      actResult = db.exec(userSql.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        state: 'slip',
        correct: false,
        actualColumns: [],
        actualRows: [],
        expectedColumns,
        expectedRows,
        diagnosis: `SQL Execution error: ${msg}`,
        nextAction: 'Check your syntax, column names, or table names and try again.',
        errorMessage: msg,
        roadmap,
        remainingMinutes: 45,
        contrastExample: task.contrastExample,
      };
    }

    const actualColumns = actResult.length > 0 ? actResult[0].columns : [];
    const actualRows = actResult.length > 0 ? (actResult[0].values as TableCell[][]) : [];

    // 4. Compare results
    const comp = compareResults(actualColumns, actualRows, expectedColumns, expectedRows, task.orderMatters);

    // 5. Assign state
    let state: 'proven' | 'hidden_strength' | 'honest_gap' | 'mirage' | 'slip';
    if (comp.correct) {
      state = prediction === 'can_do' ? 'proven' : 'hidden_strength';
    } else {
      state = prediction === 'can_do' ? 'mirage' : 'honest_gap';
    }

    // 6. Update roadmap
    let updatedRoadmap = [...roadmap];
    let remainingMinutes = 45;

    if (state === 'proven' || state === 'hidden_strength') {
      if (task.id === 'task-select-02') {
        // Variant task repairs recheck node if present
        updatedRoadmap = updatedRoadmap.map((node) => {
          if (node.isRecheck) return { ...node, status: 'repaired' as const };
          if (node.id === 'select') return { ...node, status: 'showed_once' as const };
          return node;
        });
        remainingMinutes = 35;
      } else {
        updatedRoadmap = updatedRoadmap.map((node) =>
          node.id === task.nodeId ? { ...node, status: 'showed_once' as const } : node
        );
        remainingMinutes = 38;
      }
    } else if (state === 'mirage') {
      // Insert recheck node right after the failed node
      const recheckId = `${task.nodeId}-recheck`;
      const hasRecheck = updatedRoadmap.some((n) => n.id === recheckId);
      if (!hasRecheck) {
        const idx = updatedRoadmap.findIndex((n) => n.id === task.nodeId);
        const insertPos = idx >= 0 ? idx + 1 : 1;
        const recheckNode: RoadmapNode = {
          id: recheckId,
          label: `${task.title} (Re-check)`,
          status: 'recheck',
          isRecheck: true,
          estimatedMinutes: 7,
        };
        updatedRoadmap.splice(insertPos, 0, recheckNode);
      }
      remainingMinutes = 52;
    }

    let nextAction = '';
    if (state === 'proven') {
      nextAction = 'Demonstrated with high confidence. Ready to proceed to next roadmap topic.';
    } else if (state === 'hidden_strength') {
      nextAction = 'You showed hidden strength! Query was correct despite hesitation. Proceed to next topic.';
    } else if (state === 'mirage') {
      nextAction = 'Review the contrast example below, then test your understanding on the variant retry task.';
    } else {
      nextAction = 'Review the schema panel and adjust column names or filtering conditions.';
    }

    return {
      state,
      correct: comp.correct,
      actualColumns,
      actualRows,
      expectedColumns,
      expectedRows,
      diagnosis: comp.diagnosis,
      nextAction,
      roadmap: updatedRoadmap,
      remainingMinutes,
      errorMessage: null,
      contrastExample: task.contrastExample,
    };
  } finally {
    if (db) {
      try {
        db.close();
      } catch {
        // ignore
      }
    }
  }
}
