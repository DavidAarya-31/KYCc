import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/cycles.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2020,
    target: ts.ScriptTarget.ES2020,
  },
});

const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
const { getAnniversaryCycle } = await import(moduleUrl);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertCycle(anniversaryMonth, currentDate, expectedStart, expectedEnd) {
  const cycle = getAnniversaryCycle(anniversaryMonth, currentDate);
  assert(cycle.months.length === 12, `Month count failed for anniversary ${anniversaryMonth}`);
  assert(cycle.startMonth === expectedStart, `Start month failed for anniversary ${anniversaryMonth}: ${cycle.startMonth}`);
  assert(cycle.endMonth === expectedEnd, `End month failed for anniversary ${anniversaryMonth}: ${cycle.endMonth}`);
  assert(cycle.months.every(month => /^\d{4}-\d{2}$/.test(month)), `Non YYYY-MM month found for anniversary ${anniversaryMonth}`);

  const years = Array.from(new Set(cycle.months.map(month => Number(month.slice(0, 4)))));
  assert(JSON.stringify(cycle.years) === JSON.stringify(years), `Years failed for anniversary ${anniversaryMonth}`);
}

for (let anniversaryMonth = 1; anniversaryMonth <= 12; anniversaryMonth += 1) {
  const cycle = getAnniversaryCycle(anniversaryMonth, new Date(2026, anniversaryMonth - 1, 15));
  assert(cycle.startMonth.endsWith(String(anniversaryMonth).padStart(2, '0')), `Cycle does not start on anniversary month ${anniversaryMonth}`);
}

assertCycle(1, new Date(2026, 0, 15), '2026-01', '2026-12');
assertCycle(12, new Date(2026, 0, 15), '2025-12', '2026-11');
assertCycle(6, new Date(2026, 4, 31), '2025-06', '2026-05');
assertCycle(6, new Date(2026, 5, 1), '2026-06', '2027-05');

console.log('Cycle verification passed.');
