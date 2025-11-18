/**
 * Test script for running the newsletter workflow locally
 * Run with: npm run test-newsletter
 */

const { runDailyNewsWorkflow } = require('./workflows/dailyNewsWorkflow');

console.log('🧪 Running newsletter workflow test...\n');

runDailyNewsWorkflow()
  .then((result) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Result:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60) + '\n');

    if (result.success) {
      console.log('✅ Test passed! Newsletter workflow completed successfully.');
      process.exit(0);
    } else {
      console.log('❌ Test failed:', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Fatal error during test:', error);
    process.exit(1);
  });
