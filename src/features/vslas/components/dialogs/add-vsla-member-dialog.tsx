"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { VSLAMemberForm } from "../forms";

interface AddVSLAMemberDialogProps {
  vslaId: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddVSLAMemberDialog({
  vslaId,
  children,
  onSuccess,
}: AddVSLAMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New VSLA Member</DialogTitle>
          <DialogDescription>
            Add a new member to this VSLA with their details and financial
            information.
          </DialogDescription>
        </DialogHeader>
        <VSLAMemberForm
          vslaId={vslaId}
          onSuccess={handleSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
