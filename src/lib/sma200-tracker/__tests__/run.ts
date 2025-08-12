import { runAllTests as runCsvTests } from "./googleSheetCsvAdapter.test";
import { runAllTests as runSignalTests } from "./signalService.test";
import { runAllTests as runSummaryTests } from "./summary.test";

console.log('='.repeat(50));
console.log('Running SMA200 Tracker Test Suite');
console.log('='.repeat(50));

runCsvTests();
console.log('\n' + '='.repeat(50));
runSignalTests();
console.log('\n' + '='.repeat(50));
runSummaryTests();
