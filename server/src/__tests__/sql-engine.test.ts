import { describe, it, expect, beforeAll } from 'vitest';
import {
  evaluateSqlAttempt,
  validateSqlSafety,
  compareResults,
  createSeededDb,
  SERVER_TASKS,
} from '../engine/sql-engine.js';

describe('Real SQL Execution Engine (sql.js WebAssembly)', () => {
  it('initializes in-memory database with employees and departments', async () => {
    const db = await createSeededDb();
    const empRes = db.exec('SELECT count(*) as count FROM employees;');
    expect(empRes[0].values[0][0]).toBe(5);

    const deptRes = db.exec('SELECT count(*) as count FROM departments;');
    expect(deptRes[0].values[0][0]).toBe(4);
    db.close();
  });

  describe('SQL Safety & Read-only Validation', () => {
    it('rejects empty queries', () => {
      expect(validateSqlSafety('').valid).toBe(false);
      expect(validateSqlSafety('   ').valid).toBe(false);
    });

    it('rejects DROP TABLE statements', () => {
      const res = validateSqlSafety('DROP TABLE employees;');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Only read-only SELECT');
    });

    it('rejects INSERT statements', () => {
      const res = validateSqlSafety("INSERT INTO employees VALUES (6, 'Test', 'HR', 50000, '2024-01-01');");
      expect(res.valid).toBe(false);
    });

    it('rejects UPDATE statements', () => {
      const res = validateSqlSafety("UPDATE employees SET salary = 999999;");
      expect(res.valid).toBe(false);
    });

    it('rejects multiple queries', () => {
      const res = validateSqlSafety('SELECT 1; SELECT 2;');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('single SELECT');
    });

    it('allows valid SELECT query with semicolon', () => {
      expect(validateSqlSafety('SELECT * FROM employees;').valid).toBe(true);
    });

    it('allows CTE (WITH query)', () => {
      expect(validateSqlSafety('WITH cte AS (SELECT 1) SELECT * FROM cte;').valid).toBe(true);
    });
  });

  describe('Result Comparison Engine', () => {
    it('handles identical columns and rows', () => {
      const res = compareResults(['name'], [['Alice']], ['name'], [['Alice']], false);
      expect(res.correct).toBe(true);
    });

    it('handles column case-insensitivity', () => {
      const res = compareResults(['NAME'], [['Alice']], ['name'], [['Alice']], false);
      expect(res.correct).toBe(true);
    });

    it('detects column order mismatch', () => {
      const res = compareResults(['dept', 'name'], [['HR', 'Alice']], ['name', 'dept'], [['Alice', 'HR']], false);
      expect(res.correct).toBe(false);
      expect(res.diagnosis).toContain('wrong order');
    });

    it('handles NULL values properly', () => {
      const res = compareResults(['val'], [[null]], ['val'], [[null]], false);
      expect(res.correct).toBe(true);

      const mismatch = compareResults(['val'], [[null]], ['val'], [['']], false);
      expect(mismatch.correct).toBe(false);
    });

    it('respects orderMatters: false', () => {
      const res = compareResults(['id'], [[2], [1]], ['id'], [[1], [2]], false);
      expect(res.correct).toBe(true);
    });

    it('respects orderMatters: true', () => {
      const res = compareResults(['id'], [[2], [1]], ['id'], [[1], [2]], true);
      expect(res.correct).toBe(false);
      expect(res.diagnosis).toContain('ORDER BY');
    });
  });

  describe('Deterministic Outcome Classification & Roadmap Transitions', () => {
    it('assigns proven state for can_do + correct', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-select-01',
        'SELECT name, department FROM employees;',
        'can_do'
      );
      expect(outcome.state).toBe('proven');
      expect(outcome.correct).toBe(true);
      const selectNode = outcome.roadmap.find((n) => n.id === 'select');
      expect(selectNode?.status).toBe('showed_once');
    });

    it('assigns hidden_strength for not_sure + correct', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-select-01',
        'SELECT name, department FROM employees;',
        'not_sure'
      );
      expect(outcome.state).toBe('hidden_strength');
      expect(outcome.correct).toBe(true);
    });

    it('assigns honest_gap for not_sure + incorrect', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-select-01',
        'SELECT * FROM employees;',
        'not_sure'
      );
      expect(outcome.state).toBe('honest_gap');
      expect(outcome.correct).toBe(false);
      expect(outcome.roadmap.some((n) => n.isRecheck)).toBe(false);
    });

    it('assigns mirage and inserts re-check node for can_do + incorrect', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-select-01',
        'SELECT * FROM employees;',
        'can_do'
      );
      expect(outcome.state).toBe('mirage');
      expect(outcome.correct).toBe(false);

      const recheck = outcome.roadmap.find((n) => n.id === 'select-recheck');
      expect(recheck).toBeDefined();
      expect(recheck?.status).toBe('recheck');
      expect(recheck?.isRecheck).toBe(true);
      expect(outcome.remainingMinutes).toBe(52);

      // Verify idempotent recheck insertion
      const secondAttempt = await evaluateSqlAttempt(
        'task-select-01',
        'SELECT * FROM employees;',
        'can_do',
        outcome.roadmap
      );
      const count = secondAttempt.roadmap.filter((n) => n.id === 'select-recheck').length;
      expect(count).toBe(1);
    });

    it('assigns slip for syntax errors without triggering mirage', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-select-01',
        'SELECT FROM employees',
        'can_do'
      );
      expect(outcome.state).toBe('slip');
      expect(outcome.correct).toBe(false);
      expect(outcome.errorMessage).toBeDefined();
      expect(outcome.roadmap.some((n) => n.isRecheck)).toBe(false);
    });

    it('repairs recheck node when variant task succeeds', async () => {
      const initialRoadmap = [
        { id: 'select', label: 'SELECT', status: 'not_started' as const },
        { id: 'select-recheck', label: 'SELECT (Re-check)', status: 'recheck' as const, isRecheck: true },
        { id: 'where', label: 'WHERE — AND / OR', status: 'not_started' as const },
      ];

      const outcome = await evaluateSqlAttempt(
        'task-select-02',
        'SELECT name, hire_date FROM employees;',
        'can_do',
        initialRoadmap
      );
      expect(outcome.correct).toBe(true);
      const recheck = outcome.roadmap.find((n) => n.id === 'select-recheck');
      expect(recheck?.status).toBe('repaired');
      expect(outcome.remainingMinutes).toBe(35);
    });
  });

  describe('Roadmap Topics (WHERE, ORDER BY, GROUP BY, JOIN)', () => {
    it('evaluates WHERE query with AND', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-where-01',
        "SELECT name, salary FROM employees WHERE department = 'Engineering' AND salary > 115000;",
        'can_do'
      );
      expect(outcome.correct).toBe(true);
      expect(outcome.actualRows.length).toBe(1);
      expect(outcome.actualRows[0][0]).toBe('Carol Danvers');
    });

    it('evaluates ORDER BY and LIMIT query', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-orderby-01',
        'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
        'can_do'
      );
      expect(outcome.correct).toBe(true);
      expect(outcome.actualRows.length).toBe(3);
      expect(outcome.actualRows[0][0]).toBe('Carol Danvers'); // 125000
    });

    it('evaluates GROUP BY and COUNT query', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-groupby-01',
        'SELECT department, COUNT(*) AS count FROM employees GROUP BY department;',
        'can_do'
      );
      expect(outcome.correct).toBe(true);
      expect(outcome.actualRows.length).toBe(3); // Engineering, Analytics, Marketing
    });

    it('evaluates JOIN query across employees and departments', async () => {
      const outcome = await evaluateSqlAttempt(
        'task-join-01',
        'SELECT employees.name, departments.building FROM employees JOIN departments ON employees.department = departments.name;',
        'can_do'
      );
      expect(outcome.correct).toBe(true);
      expect(outcome.actualRows.length).toBe(5);
    });
  });
});
