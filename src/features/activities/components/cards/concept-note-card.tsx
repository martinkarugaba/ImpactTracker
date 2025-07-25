import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface ConceptNoteCardProps {
  conceptNote: string | null;
  onCreateConceptNote?: () => void;
}

export function ConceptNoteCard({
  conceptNote,
  onCreateConceptNote,
}: ConceptNoteCardProps) {
  if (!conceptNote) {
    return (
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-indigo-900">Concept Note</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="mb-4 text-sm text-indigo-700">
              No concept note has been created for this activity yet.
            </p>
            {onCreateConceptNote && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateConceptNote}
                className="border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Concept Note
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-indigo-900">Concept Note</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-indigo-800">
              Content
            </label>
            <div className="mt-1 max-h-40 overflow-y-auto rounded border border-indigo-200 bg-white/50 p-3">
              <p className="text-sm whitespace-pre-wrap text-gray-800">
                {conceptNote}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
