import { testDbConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log(
      "DATABASE_URL preview:",
      process.env.DATABASE_URL?.substring(0, 20) + "..."
    );

    const isConnected = await testDbConnection();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection test failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : "No message",
          type: typeof error,
        },
      },
      { status: 500 }
    );
  }
}
