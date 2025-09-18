"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDeleteMember } from "../api/use-delete-member";

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface DeleteMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteMemberModal = ({ member, isOpen, onClose }: DeleteMemberModalProps) => {
  const { mutate: deleteMember, isPending } = useDeleteMember();

  if (!member) return null;

  const handleDelete = () => {
    deleteMember(member.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Member
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the member
            from your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm">
            <strong>Member to delete:</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            {member.firstName} {member.lastName} ({member.email})
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
