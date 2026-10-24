import { TableCell } from '../types/contract';

export interface CellDiff {
  value: TableCell;
  isMismatch: boolean;
  expectedValue?: TableCell;
}

export type RowDiffStatus = 'match' | 'extra' | 'missing' | 'mismatch';

export interface RowDiff {
  rowIndex: number;
  status: RowDiffStatus;
  actualRow?: TableCell[];
  expectedRow?: TableCell[];
  cells?: CellDiff[];
}

export interface ComparisonResult {
  columnsMatch: boolean;
  missingColumns: string[];
  extraColumns: string[];
  rowsMatch: boolean;
  matchedCount: number;
  extraCount: number;
  missingCount: number;
  mismatchedCount: number;
  rowDiffs: RowDiff[];
}

/**
 * Format cell value safely: distinguishes null, undefined, boolean, number, string.
 */
export function formatCellValue(value: TableCell): { text: string; isNull: boolean } {
  if (value === null || value === undefined) {
    return { text: 'NULL', isNull: true };
  }
  return { text: String(value), isNull: false };
}

/**
 * Canonical string representation of a table row for set comparison.
 */
function serializeRow(row: TableCell[]): string {
  return JSON.stringify(row.map((cell) => (cell === null || cell === undefined ? null : cell)));
}

/**
 * Compare actual vs expected query tabular outputs respecting column schema and orderMatters.
 */
export function compareQueryResults(
  actualColumns: string[],
  actualRows: TableCell[][],
  expectedColumns: string[],
  expectedRows: TableCell[][],
  orderMatters: boolean
): ComparisonResult {
  // 1. Column Comparison (case-insensitive for SQL column matching)
  const normActualCols = actualColumns.map((c) => c.toLowerCase());
  const normExpectedCols = expectedColumns.map((c) => c.toLowerCase());

  const missingColumns = expectedColumns.filter(
    (col) => !normActualCols.includes(col.toLowerCase())
  );
  const extraColumns = actualColumns.filter(
    (col) => !normExpectedCols.includes(col.toLowerCase())
  );

  const columnsMatch =
    actualColumns.length === expectedColumns.length &&
    missingColumns.length === 0 &&
    extraColumns.length === 0 &&
    actualColumns.every((col, idx) => col.toLowerCase() === expectedColumns[idx].toLowerCase());

  // 2. Row Comparison
  const rowDiffs: RowDiff[] = [];
  let matchedCount = 0;
  let extraCount = 0;
  let missingCount = 0;
  let mismatchedCount = 0;

  if (orderMatters) {
    // Strict index-by-index comparison
    const maxRows = Math.max(actualRows.length, expectedRows.length);

    for (let i = 0; i < maxRows; i++) {
      const act = actualRows[i];
      const exp = expectedRows[i];

      if (act && exp) {
        const isSame = serializeRow(act) === serializeRow(exp);
        if (isSame) {
          matchedCount++;
          rowDiffs.push({
            rowIndex: i,
            status: 'match',
            actualRow: act,
            expectedRow: exp
          });
        } else {
          mismatchedCount++;
          const cells: CellDiff[] = act.map((cell, cIdx) => ({
            value: cell,
            isMismatch: exp[cIdx] === undefined || String(cell) !== String(exp[cIdx]),
            expectedValue: exp[cIdx]
          }));
          rowDiffs.push({
            rowIndex: i,
            status: 'mismatch',
            actualRow: act,
            expectedRow: exp,
            cells
          });
        }
      } else if (act && !exp) {
        extraCount++;
        rowDiffs.push({
          rowIndex: i,
          status: 'extra',
          actualRow: act
        });
      } else if (!act && exp) {
        missingCount++;
        rowDiffs.push({
          rowIndex: i,
          status: 'missing',
          expectedRow: exp
        });
      }
    }
  } else {
    // Unordered matching: Match identical rows regardless of position
    const expPool = expectedRows.map((r, idx) => ({ row: r, serialized: serializeRow(r), matched: false, originalIndex: idx }));
    const actPool = actualRows.map((r, idx) => ({ row: r, serialized: serializeRow(r), matched: false, originalIndex: idx }));

    // Find exact matches first
    for (const actItem of actPool) {
      const match = expPool.find((e) => !e.matched && e.serialized === actItem.serialized);
      if (match) {
        actItem.matched = true;
        match.matched = true;
        matchedCount++;
        rowDiffs.push({
          rowIndex: actItem.originalIndex,
          status: 'match',
          actualRow: actItem.row,
          expectedRow: match.row
        });
      }
    }

    // Remaining actual rows are either mismatches or extra rows
    for (const actItem of actPool) {
      if (!actItem.matched) {
        const unmatchedExp = expPool.find((e) => !e.matched);
        if (unmatchedExp) {
          unmatchedExp.matched = true;
          mismatchedCount++;
          const cells: CellDiff[] = actItem.row.map((cell, cIdx) => ({
            value: cell,
            isMismatch: unmatchedExp.row[cIdx] === undefined || String(cell) !== String(unmatchedExp.row[cIdx]),
            expectedValue: unmatchedExp.row[cIdx]
          }));
          rowDiffs.push({
            rowIndex: actItem.originalIndex,
            status: 'mismatch',
            actualRow: actItem.row,
            expectedRow: unmatchedExp.row,
            cells
          });
        } else {
          extraCount++;
          rowDiffs.push({
            rowIndex: actItem.originalIndex,
            status: 'extra',
            actualRow: actItem.row
          });
        }
      }
    }

    // Any remaining expected rows are missing
    for (const expItem of expPool) {
      if (!expItem.matched) {
        missingCount++;
        rowDiffs.push({
          rowIndex: expItem.originalIndex,
          status: 'missing',
          expectedRow: expItem.row
        });
      }
    }
  }

  const rowsMatch =
    columnsMatch &&
    actualRows.length === expectedRows.length &&
    matchedCount === expectedRows.length &&
    extraCount === 0 &&
    missingCount === 0 &&
    mismatchedCount === 0;

  return {
    columnsMatch,
    missingColumns,
    extraColumns,
    rowsMatch,
    matchedCount,
    extraCount,
    missingCount,
    mismatchedCount,
    rowDiffs
  };
}
