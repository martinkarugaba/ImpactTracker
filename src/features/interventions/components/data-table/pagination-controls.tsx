"use client";

import React from "react";

export function PaginationControls({
  pagination,
  onPaginationChange: _onPaginationChange,
  onPageChange,
}: {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange: (page: number, limit: number) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="muted-foreground text-sm">
        Page {pagination.page} of {pagination.totalPages}
      </div>
      <div className="flex space-x-2">
        <button
          className="btn"
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        >
          Prev
        </button>
        <button
          className="btn"
          onClick={() =>
            onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
