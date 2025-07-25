declare global {
  interface Window {
    onEditConceptNote?: (conceptNoteId: string) => void;
    onDeleteConceptNote?: (conceptNoteId: string) => void;
  }
}

export {};
