"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ProjectForm } from "./project-form";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface CreateProjectDialogProps {
  children?: React.ReactNode;
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create Project"
        description="Add a new project to manage organizations and KPIs."
        className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]"
      >
        <ProjectForm
          onSuccess={() => setOpen(false)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </Modal>
    </Dialog>
  );
}
