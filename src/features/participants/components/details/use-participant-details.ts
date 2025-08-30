"use client";

import { useEffect, useState } from "react";
import { getParticipant } from "../../actions/get-participant";
import { type Participant } from "../../types/types";
import toast from "react-hot-toast";

interface UseParticipantDetailsProps {
  participantId: string;
}

export function useParticipantDetails({
  participantId,
}: UseParticipantDetailsProps) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    async function fetchParticipant() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getParticipant(participantId);

        if (result.success && result.data) {
          setParticipant(result.data);
        } else {
          setError(result.error || "Failed to load participant details");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching participant:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (participantId) {
      fetchParticipant();
    }
  }, [participantId]);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Convert to base64 for preview (in a real app, you'd upload to a server)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success("Photo uploaded successfully");
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast.error("Failed to upload photo");
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (_error) {
      toast.error("Failed to upload photo");
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    toast.success("Photo removed successfully");
  };

  const refetchParticipant = async () => {
    if (participantId) {
      setIsLoading(true);
      const result = await getParticipant(participantId);
      if (result.success && result.data) {
        setParticipant(result.data);
      }
      setIsLoading(false);
    }
  };

  return {
    participant,
    isLoading,
    error,
    profilePhoto,
    isUploadingPhoto,
    handlePhotoUpload,
    removePhoto,
    refetchParticipant,
  };
}
