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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-5 w-5" />
            <CardTitle>Concept Note</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              No concept note has been created for this activity yet.
            </p>
            {onCreateConceptNote && (
              <Button variant="outline" size="sm" onClick={onCreateConceptNote}>
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-5 w-5" />
          <CardTitle>Concept Note</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Content
            </label>
            <div className="mt-1 max-h-40 overflow-y-auto rounded border p-3">
              <p className="text-sm whitespace-pre-wrap">{conceptNote}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
