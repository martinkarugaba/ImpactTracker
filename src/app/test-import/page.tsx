"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { testParticipantImport } from "@/features/participants/test-import";
import { debugParticipantImport } from "@/features/participants/debug-import";
import { runMinimalImportTest } from "@/features/participants/minimal-test";

export default function TestImportPage() {
  const [result, setResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [debugResult, setDebugResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [minimalResult, setMinimalResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestImport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await testParticipantImport();
      setResult(response);

      if (!response.success) {
        setError(response.error || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await debugParticipantImport();
      setDebugResult(response);

      if (!response.success) {
        setError(response.error || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setDebugResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMinimalTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await runMinimalImportTest();
      setMinimalResult(response);

      if (!response.success) {
        setError(response.error || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setMinimalResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Test Participant Import</h1>

      <div className="mb-4 flex gap-4">
        <Button onClick={handleDebug} disabled={loading} variant="outline">
          {loading ? "Debugging..." : "Debug Database"}
        </Button>

        <Button
          onClick={handleMinimalTest}
          disabled={loading}
          variant="secondary"
        >
          {loading ? "Testing..." : "Minimal Test"}
        </Button>

        <Button onClick={handleTestImport} disabled={loading}>
          {loading ? "Testing..." : "Full Test Import"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {debugResult && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">Debug Result:</h2>
          <pre className="max-h-[300px] overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}

      {minimalResult && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">Minimal Test Result:</h2>
          <pre className="max-h-[300px] overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(minimalResult, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">
            Full Test Import Result:
          </h2>
          <pre className="max-h-[300px] overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
