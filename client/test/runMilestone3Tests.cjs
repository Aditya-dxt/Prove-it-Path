const assert = require('node:assert');
const { compareQueryResults, formatCellValue } = require('../dist-test/lib/diffUtils.js');
const { runMockEvaluation } = require('../dist-test/lib/mockEngine.js');
const { STARTER_TASK, VARIANT_TASK, INITIAL_ROADMAP_NODES } = require('../dist-test/data/tasks.js');

console.log('--- STARTING MILESTONE 3 VERIFICATION SUITE ---\n');

let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function runAll() {
  // ==========================================
  // SCENARIO GROUP 1: RESULT COMPARISON TESTS
  // ==========================================

  test('1.1 Identical columns and rows match perfectly', () => {
    const cols = ['name', 'dept'];
    const rows = [['Alice', 'Eng'], ['Bob', 'Sales']];
    const res = compareQueryResults(cols, rows, cols, rows, false);

    assert.strictEqual(res.columnsMatch, true);
    assert.strictEqual(res.rowsMatch, true);
    assert.strictEqual(res.matchedCount, 2);
    assert.strictEqual(res.missingCount, 0);
    assert.strictEqual(res.extraCount, 0);
  });

  test('1.2 Missing row in actual results', () => {
    const expRows = [['Alice', 'Eng'], ['Bob', 'Sales']];
    const actRows = [['Alice', 'Eng']];
    const res = compareQueryResults(['name', 'dept'], actRows, ['name', 'dept'], expRows, false);

    assert.strictEqual(res.rowsMatch, false);
    assert.strictEqual(res.matchedCount, 1);
    assert.strictEqual(res.missingCount, 1);
    assert.strictEqual(res.extraCount, 0);
  });

  test('1.3 Extra row in actual results', () => {
    const expRows = [['Alice', 'Eng']];
    const actRows = [['Alice', 'Eng'], ['Charlie', 'HR']];
    const res = compareQueryResults(['name', 'dept'], actRows, ['name', 'dept'], expRows, false);

    assert.strictEqual(res.rowsMatch, false);
    assert.strictEqual(res.matchedCount, 1);
    assert.strictEqual(res.extraCount, 1);
  });

  test('1.4 Cell mismatch in actual row', () => {
    const expRows = [['Alice', 'Eng']];
    const actRows = [['Alice', 'Marketing']];
    const res = compareQueryResults(['name', 'dept'], actRows, ['name', 'dept'], expRows, false);

    assert.strictEqual(res.rowsMatch, false);
    assert.strictEqual(res.mismatchedCount, 1);
    assert.strictEqual(res.matchedCount, 0);
    assert.strictEqual(res.rowDiffs[0].status, 'mismatch');
    assert.strictEqual(res.rowDiffs[0].cells[1].isMismatch, true);
  });

  test('1.5 Column mismatch: Extra columns returned', () => {
    const actCols = ['id', 'name', 'dept'];
    const expCols = ['name', 'dept'];
    const rows = [[1, 'Alice', 'Eng']];
    const expRows = [['Alice', 'Eng']];
    const res = compareQueryResults(actCols, rows, expCols, expRows, false);

    assert.strictEqual(res.columnsMatch, false);
    assert.deepStrictEqual(res.extraColumns, ['id']);
    assert.strictEqual(res.missingColumns.length, 0);
  });

  test('1.6 NULL values handled distinct from empty strings', () => {
    const valNull = formatCellValue(null);
    const valEmpty = formatCellValue('');
    const valZero = formatCellValue(0);

    assert.strictEqual(valNull.isNull, true);
    assert.strictEqual(valNull.text, 'NULL');
    assert.strictEqual(valEmpty.isNull, false);
    assert.strictEqual(valEmpty.text, '');
    assert.strictEqual(valZero.isNull, false);
    assert.strictEqual(valZero.text, '0');
  });

  test('1.7 Duplicate rows handled correctly', () => {
    const expRows = [['Alice', 'Eng'], ['Alice', 'Eng']];
    const actRows = [['Alice', 'Eng']];
    const res = compareQueryResults(['name', 'dept'], actRows, ['name', 'dept'], expRows, false);

    assert.strictEqual(res.rowsMatch, false);
    assert.strictEqual(res.matchedCount, 1);
    assert.strictEqual(res.missingCount, 1);
  });

  test('1.8 Order does NOT matter (orderMatters: false)', () => {
    const expRows = [['Alice', 'Eng'], ['Bob', 'Sales']];
    const actRows = [['Bob', 'Sales'], ['Alice', 'Eng']]; // reversed
    const res = compareQueryResults(['name', 'dept'], actRows, ['name', 'dept'], expRows, false);

    assert.strictEqual(res.rowsMatch, true);
    assert.strictEqual(res.matchedCount, 2);
    assert.strictEqual(res.mismatchedCount, 0);
  });

  test('1.9 Order DOES matter (orderMatters: true)', () => {
    const expRows = [['Alice', 'Eng'], ['Bob', 'Sales']];
    const actRows = [['Bob', 'Sales'], ['Alice', 'Eng']]; // reversed
    const res = compareQueryResults(['name', 'dept'], actRows, ['name', 'dept'], expRows, true);

    assert.strictEqual(res.rowsMatch, false);
    assert.strictEqual(res.matchedCount, 0);
    assert.strictEqual(res.mismatchedCount, 2);
  });

  test('1.10 Empty result sets', () => {
    const res = compareQueryResults(['name'], [], ['name'], [], false);
    assert.strictEqual(res.rowsMatch, true);
    assert.strictEqual(res.matchedCount, 0);
  });

  // ==========================================
  // SCENARIO GROUP 2: LEARNER STATES & ROADMAP
  // ==========================================

  await testAsync('2.1 Proven state (can_do + correct)', async () => {
    const outcome = await runMockEvaluation(
      STARTER_TASK,
      'SELECT name, department FROM employees;',
      'can_do',
      { simulatedDelayMs: 0 }
    );

    assert.strictEqual(outcome.state, 'proven');
    assert.strictEqual(outcome.correct, true);
    const selectNode = outcome.roadmap.find((n) => n.id === 'select');
    assert.strictEqual(selectNode.status, 'showed_once');
    assert.strictEqual(outcome.roadmap.some((n) => n.isRecheck), false);
  });

  await testAsync('2.2 Hidden Strength state (not_sure + correct)', async () => {
    const outcome = await runMockEvaluation(
      STARTER_TASK,
      'SELECT name, department FROM employees;',
      'not_sure',
      { simulatedDelayMs: 0 }
    );

    assert.strictEqual(outcome.state, 'hidden_strength');
    assert.strictEqual(outcome.correct, true);
    const selectNode = outcome.roadmap.find((n) => n.id === 'select');
    assert.strictEqual(selectNode.status, 'showed_once');
  });

  await testAsync('2.3 Honest Gap state (not_sure + incorrect)', async () => {
    const outcome = await runMockEvaluation(
      STARTER_TASK,
      'SELECT * FROM employees;',
      'not_sure',
      { simulatedDelayMs: 0 }
    );

    assert.strictEqual(outcome.state, 'honest_gap');
    assert.strictEqual(outcome.correct, false);
    assert.strictEqual(outcome.roadmap.some((n) => n.isRecheck), false);
  });

  await testAsync('2.4 Slip state (syntax error)', async () => {
    const outcome = await runMockEvaluation(
      STARTER_TASK,
      'SELECT FROM employees',
      'can_do',
      { simulatedDelayMs: 0 }
    );

    assert.strictEqual(outcome.state, 'slip');
    assert.strictEqual(outcome.correct, false);
    assert(Boolean(outcome.errorMessage));
    assert.strictEqual(outcome.roadmap.some((n) => n.isRecheck), false);
  });

  await testAsync('2.5 Mirage state inserts Re-check node into roadmap', async () => {
    const outcome = await runMockEvaluation(
      STARTER_TASK,
      'SELECT * FROM employees;',
      'can_do',
      { simulatedDelayMs: 0 },
      INITIAL_ROADMAP_NODES
    );

    assert.strictEqual(outcome.state, 'mirage');
    assert.strictEqual(outcome.correct, false);

    const recheckNode = outcome.roadmap.find((n) => n.id === 'select-recheck');
    assert(Boolean(recheckNode), 'Roadmap must contain inserted select-recheck node');
    assert.strictEqual(recheckNode.status, 'recheck');
    assert.strictEqual(recheckNode.isRecheck, true);
    assert.strictEqual(outcome.remainingMinutes, 52, 'Remaining minutes must adjust upwards for re-check');

    // Verify position: must immediately follow 'select'
    const selectIdx = outcome.roadmap.findIndex((n) => n.id === 'select');
    const recheckIdx = outcome.roadmap.findIndex((n) => n.id === 'select-recheck');
    assert.strictEqual(recheckIdx, selectIdx + 1, 'Re-check node must be positioned right after select node');

    // Verify idempotency: re-evaluating with already inserted roadmap does NOT duplicate
    const secondOutcome = await runMockEvaluation(
      STARTER_TASK,
      'SELECT * FROM employees;',
      'can_do',
      { simulatedDelayMs: 0 },
      outcome.roadmap
    );
    const recheckCount = secondOutcome.roadmap.filter((n) => n.id === 'select-recheck').length;
    assert.strictEqual(recheckCount, 1, 'Re-check node must not be duplicated');
  });

  // ==========================================
  // SCENARIO GROUP 3: VARIANT RETRY FLOW
  // ==========================================

  await testAsync('3.1 Variant task execution and Re-check repair', async () => {
    const mirageRoadmap = [
      { id: 'select', label: 'SELECT', status: 'not_started' },
      { id: 'select-recheck', label: 'SELECT (Re-check)', status: 'recheck', isRecheck: true },
      { id: 'where', label: 'WHERE — AND / OR', status: 'not_started' }
    ];

    const outcome = await runMockEvaluation(
      VARIANT_TASK,
      'SELECT name, hire_date FROM employees;',
      'can_do',
      { simulatedDelayMs: 0 },
      mirageRoadmap
    );

    assert.strictEqual(outcome.correct, true);
    const recheckNode = outcome.roadmap.find((n) => n.id === 'select-recheck');
    assert.strictEqual(recheckNode.status, 'repaired', 'Re-check node must be marked as repaired');
    assert.strictEqual(outcome.remainingMinutes, 35, 'Remaining minutes adjusted after repair');
  });

  console.log(`\n--- ALL ${passedTests} TESTS PASSED SUCCESSFULLY! ---`);
}

runAll();
