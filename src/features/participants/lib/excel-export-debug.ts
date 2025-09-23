// Debug utilities for Excel export functionality
export function debugExcelExport() {
  console.log("🔍 Excel Export Debug Information:");

  // Check if XLSX is available
  try {
    import("xlsx").then(XLSX => {
      console.log("✅ XLSX library loaded:", !!XLSX);
      console.log("✅ XLSX version:", XLSX?.version || "unknown");
    });
  } catch (error) {
    console.error("❌ XLSX library not available:", error);
  }

  // Check browser environment
  console.log("🌐 Environment checks:");
  console.log("- typeof window:", typeof window);
  console.log("- typeof document:", typeof document);
  console.log(
    "- navigator.userAgent:",
    typeof window !== "undefined" ? navigator.userAgent : "N/A"
  );

  // Check Blob and URL support
  console.log("📁 Browser API support:");
  console.log("- Blob:", typeof Blob !== "undefined");
  console.log(
    "- URL.createObjectURL:",
    typeof URL !== "undefined" && !!URL.createObjectURL
  );
  console.log(
    "- document.createElement:",
    typeof document !== "undefined" && !!document.createElement
  );

  // Test basic download functionality
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const testBlob = new Blob(["test"], { type: "text/plain" });
      const testUrl = URL.createObjectURL(testBlob);
      const _testLink = document.createElement("a");
      console.log("✅ Basic download APIs working");
      URL.revokeObjectURL(testUrl);
    } catch (error) {
      console.error("❌ Basic download APIs not working:", error);
    }
  }
}
