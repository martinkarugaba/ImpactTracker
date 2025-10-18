import { deleteMultipleActivities } from "./src/features/activities/actions/index";

async function testBulkDelete() {
  try {
    // Test with some activity IDs (you'll need to replace these with actual IDs from your database)
    const activityIds = ["test-id-1", "test-id-2", "test-id-3"]; // Replace with actual activity IDs

    console.log("Testing bulk delete for activities:", activityIds);

    const result = await deleteMultipleActivities(activityIds);

    console.log("Bulk delete result:", result);

    if (result.success) {
      console.log("✅ Bulk delete completed successfully");
    } else {
      console.log("❌ Bulk delete failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error during bulk delete test:", error);
  }
}

testBulkDelete();
