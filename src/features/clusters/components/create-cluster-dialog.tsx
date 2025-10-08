"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClusterForm } from "./cluster-form";
import { Plus } from "lucide-react";

interface CreateClusterDialogProps {
  children?: React.ReactNode;
}

export function CreateClusterDialog({ children }: CreateClusterDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      {children ? (
        <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Cluster
        </Button>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create Cluster"
        description="Add a new cluster to manage organizations and KPIs"
        className="sm:max-w-[500px]"
      >
        <ClusterForm
          onSuccess={handleSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </Modal>
    </>
  );
}
