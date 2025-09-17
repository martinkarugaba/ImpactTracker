"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EnhancedVSLAMemberForm } from "../forms";
import { VSLAMember } from "../../actions/vsla-members";

interface EditVSLAMemberDialogProps {
  member: VSLAMember;
  onSuccess?: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditVSLAMemberDialog({
  member,
  onSuccess,
  children,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: EditVSLAMemberDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit VSLA Member</DialogTitle>
          <DialogDescription>
            Update member information including personal details, savings,
            loans, role, and status.
          </DialogDescription>
        </DialogHeader>
        <EnhancedVSLAMemberForm
          member={member}
          onSuccess={handleSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
