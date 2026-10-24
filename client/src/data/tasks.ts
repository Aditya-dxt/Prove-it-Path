import { Task, RoadmapNode } from '../types/contract';

export const INITIAL_ROADMAP_NODES: RoadmapNode[] = [
  { id: 'select', label: 'SELECT', status: 'not_started' },
  { id: 'where', label: 'WHERE — AND / OR', status: 'not_started' },
  { id: 'orderby', label: 'ORDER BY — LIMIT', status: 'not_started' },
  { id: 'groupby', label: 'GROUP BY — COUNT', status: 'not_started' },
  { id: 'join', label: 'JOIN', status: 'not_started' }
];

export const STARTER_TASK: Task = {
  id: 'task-select-01',
  nodeId: 'select',
  title: 'Find the employees',
  description: 'Return the names and departments of all employees in the provided dataset.',
  orderMatters: false,
  starterSql: '-- Return the name and department of all employees\nSELECT name, department\nFROM employees;',
  schema: [
    {
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'name', type: 'TEXT' },
        { name: 'department', type: 'TEXT' },
        { name: 'salary', type: 'INTEGER' },
        { name: 'hire_date', type: 'DATE' }
      ],
      sampleRows: [
        { id: 1, name: 'Alice Chen', department: 'Engineering', salary: 110000, hire_date: '2022-03-15' },
        { id: 2, name: 'Bob Smith', department: 'Analytics', salary: 92000, hire_date: '2021-07-01' },
        { id: 3, name: 'Carol Danvers', department: 'Engineering', salary: 125000, hire_date: '2020-01-10' },
        { id: 4, name: 'David Miller', department: 'Marketing', salary: 85000, hire_date: '2023-04-20' },
        { id: 5, name: 'Elena Rostova', department: 'Analytics', salary: 98000, hire_date: '2022-11-05' }
      ]
    }
  ],
  contrastExample: {
    title: 'Projection vs Wildcard',
    description: 'Selecting specific columns rather than using SELECT *',
    sql: 'SELECT name, department FROM employees;',
    explanation: 'A projection ensures only the requested columns (name, department) are returned, preventing unwanted columns from failing the evaluation.'
  }
};
