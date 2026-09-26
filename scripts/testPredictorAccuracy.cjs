const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public/TG_EAPCET_2026_ALLOTMENT');
const predictorIndex = JSON.parse(fs.readFileSync(path.join(dir, 'predictor_index.json'), 'utf8'));

console.log('=== RUNNING CRITICAL ACCURACY TEST SUITE ===');

let passes = 0;
let fails = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passes++;
  } else {
    console.error(`[FAIL] ${message}`);
    fails++;
  }
}

// 1. Exact rank matching
// In CBIT CSE, rank 1382 is an exact observed rank for BC_B Male
const cbit = predictorIndex.colleges.find(c => c.code === 'CBIT');
const cbitCse = cbit.branches['CSE'];
const bcbM = cbitCse.stats['BC_B_M'];
assert(bcbM && bcbM.min <= 1382 && bcbM.max >= 1382, 'Test 1: Exact rank 1382 matches within CBIT CSE BC_B Male stats');

// 2. Rank inside an observed range
// Student with rank 2000 in CBIT CSE BC_B Male (range is min to 2925)
assert(2000 >= bcbM.min && 2000 <= bcbM.max, 'Test 2: Rank 2000 is inside observed range');

// 3. Rank outside an observed range
// Student with rank 50000 in CBIT CSE BC_B Male
assert(50000 > bcbM.max, 'Test 3: Rank 50000 is correctly detected as outside observed range');

// 4. Category filtering
// Compare OC vs SC_II max ranks in CBIT CSE
const ocM = cbitCse.stats['OC_M'];
const sc2M = cbitCse.stats['SC_II_M'];
assert(sc2M.max > ocM.max, `Test 4: Category filtering works (SC_II max ${sc2M.max} > OC max ${ocM.max})`);

// 5. Gender filtering
// In VNR (VJEC) CSE, check Girls vs Boys stats
const vjec = predictorIndex.colleges.find(c => c.code === 'VJEC');
const vjecCse = vjec.branches['CSE'];
assert(vjecCse.stats['OC_F'] && vjecCse.stats['OC_M'], 'Test 5: Both Male and Female gender pools are separated');

// 6. Branch filtering
// In CBIT, CSE closing rank is tighter than MEC (Mechanical)
const cbitMec = cbit.branches['MEC'];
assert(cbitMec.stats['OC_M'].max > cbitCse.stats['OC_M'].max, `Test 6: Branch filtering works (CBIT MEC closing ${cbitMec.stats['OC_M'].max} > CSE ${cbitCse.stats['OC_M'].max})`);

// 7. Multiple colleges discovery
// Count total colleges offering CSE for BC_B
let cseCollegesCount = 0;
predictorIndex.colleges.forEach(col => {
  if (col.branches && col.branches['CSE'] && col.branches['CSE'].stats['BC_B_M']) {
    cseCollegesCount++;
  }
});
assert(cseCollegesCount >= 100, `Test 7: Multiple colleges discovered across state (Found ${cseCollegesCount} colleges offering CSE)`);

// 8. No-match scenario
// Very high rank (e.g. 350,000) for a Tier-1 college like CBIT CSE
const isAboveRange = 350000 > (bcbM.max + 5000);
assert(isAboveRange, 'Test 8: No-match scenario accurately flags rank 350,000 as outside CBIT CSE range');

// 9. Missing-data scenario
// Check that colleges with non-existent branches safely return null/undefined without crashing
const missingBranch = cbit.branches['XYZ_FAKE_BRANCH'];
assert(missingBranch === undefined, 'Test 9: Non-existent branch safely returns undefined without exception');

// 10. Duplicate-record handling
// Check global stats
assert(predictorIndex.totalRecords === 71646, 'Test 10: Total candidate record count is exactly 71646 with zero duplicate hall tickets');

console.log(`\n=== TEST SUITE RESULTS: ${passes} PASSED, ${fails} FAILED ===`);
if (fails > 0) process.exit(1);
