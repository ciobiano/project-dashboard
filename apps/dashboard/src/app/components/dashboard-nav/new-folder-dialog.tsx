"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface NewFolderDialogProps {
  onCreate: (name: string) => Promise<unknown>;
  isCreating?: boolean;
}

export function NewFolderDialog({
  onCreate,
  isCreating = false,
}: NewFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setName("");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Folder name is required");
      return;
    }
    setError(null);
    try {
      await onCreate(trimmed);
      toast({
        title: "Folder created",
        description: `"${trimmed}" was added to the workspace.`,
      });
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create folder";
      setError(message);
      toast({
        title: "Could not create folder",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-900/5 disabled:pointer-events-none disabled:opacity-60 dark:hover:bg-white/5"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          New Folder
        </button>
      </DialogTrigger>
      <DialogContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>
              Name the folder you want to add to this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/80">
              Folder Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Brand Systems, Client Projects..."
              autoFocus
            />
            {error ? (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
