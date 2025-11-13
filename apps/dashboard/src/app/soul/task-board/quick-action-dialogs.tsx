"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { WorkspaceSummary } from "@/types/workspace";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().max(320).optional(),
  assignees: z.string().optional(),
  priority: z.enum(["High", "Medium", "Normal"]),
  status: z.string().min(1, "Status column is required"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().max(320).optional(),
  workspaceId: z.string().min(1, "Workspace is required"),
  folderId: z.string().min(1, "Folder is required"),
});

export const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  workspaceId: z.string().min(1, "Workspace is required"),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
export type ProjectFormValues = z.infer<typeof projectSchema>;
export type FolderFormValues = z.infer<typeof folderSchema>;

export type StatusOption = { value: string; label: string };
export type FolderOption = { id: string; name: string };

const fieldClassName =
  "rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

interface TaskActionDialogProps {
  form: UseFormReturn<TaskFormValues>;
  statusOptions: StatusOption[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function TaskActionDialog({
  form,
  statusOptions,
  onSubmit,
  onCancel,
}: TaskActionDialogProps) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Task</DialogTitle>
        <DialogDescription>
          Tasks drop into the selected status column.
        </DialogDescription>
      </DialogHeader>
      <form className="space-y-4 gap-x-4" onSubmit={onSubmit}>
        <Field label="Title" error={errors.title?.message}>
          <Input
            autoFocus
            placeholder="Describe the task"
            {...register("title")}
          />
        </Field>
        <Field label="Description" error={errors.description?.message}>
          <textarea
            className={cn(fieldClassName, "min-h-[96px] w-full  resize-none")}
            placeholder="Add context, links, or acceptance criteria"
            {...register("description")}
          />
        </Field>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <Field label="Priority" error={errors.priority?.message}>
            <select className={cn(fieldClassName, "h-10 mx-2")} {...register("priority")}>
              {["High", "Medium", "Normal"].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <select
              className={cn(fieldClassName, "h-10 mx-2")}
              disabled={!statusOptions.length}
              {...register("status")}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Assignees"
          helperText="Comma-separated names (we keep initials)."
          error={errors.assignees?.message}
        >
          <Input
            placeholder="Alex Li, Morgan Bates"
            {...register("assignees")}
          />
        </Field>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !statusOptions.length}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface ProjectActionDialogProps {
  form: UseFormReturn<ProjectFormValues>;
  workspaceOptions: WorkspaceSummary[];
  folderOptions: FolderOption[];
  onWorkspaceChange: (workspaceId: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function ProjectActionDialog({
  form,
  workspaceOptions,
  folderOptions,
  onWorkspaceChange,
  onSubmit,
  onCancel,
}: ProjectActionDialogProps) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;
  const workspaceField = register("workspaceId");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Project</DialogTitle>
        <DialogDescription>
          Projects live under folders so teammate access stays in sync.
        </DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Name" error={errors.name?.message}>
          <Input
            autoFocus
            placeholder="E-Commerce Revamp"
            {...register("name")}
          />
        </Field>
        <Field label="Workspace" error={errors.workspaceId?.message}>
          <select
            className={cn(fieldClassName, "h-10 mx-2")}
            {...workspaceField}
            onChange={(event) => {
              workspaceField.onChange(event);
              onWorkspaceChange(event.target.value);
            }}
          >
            {workspaceOptions.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Folder" error={errors.folderId?.message}>
          <select
            className={cn(fieldClassName, "h-10 mx-2")}
            disabled={!folderOptions.length}
            {...register("folderId")}
          >
            {folderOptions.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          {!folderOptions.length ? (
            <p className="text-xs text-muted-foreground">
              No folders yet. Create one first.
            </p>
          ) : null}
        </Field>
        <Field label="Description" error={errors.description?.message}>
          <textarea
            className={cn(fieldClassName, "min-h-[96px] w-full resize-none")}
            placeholder="Add context for the project team"
            {...register("description")}
          />
        </Field>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !folderOptions.length}
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface FolderActionDialogProps {
  form: UseFormReturn<FolderFormValues>;
  workspaceOptions: WorkspaceSummary[];
  onWorkspaceChange: (workspaceId: string) => void;
  isCreating: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function FolderActionDialog({
  form,
  workspaceOptions,
  onWorkspaceChange,
  isCreating,
  onSubmit,
  onCancel,
}: FolderActionDialogProps) {
  const {
    register,
    formState: { errors },
  } = form;
  const workspaceField = register("workspaceId");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Folder</DialogTitle>
        <DialogDescription>
          Folders roll up projects and inherit workspace permissions.
        </DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Name" error={errors.name?.message}>
          <Input
            autoFocus
            placeholder="Client Projects"
            {...register("name")}
          />
        </Field>
        <Field label="Workspace" error={errors.workspaceId?.message}>
          <select
            className={cn(fieldClassName, "h-10 mx-2")}
            {...workspaceField}
            onChange={(event) => {
              workspaceField.onChange(event);
              onWorkspaceChange(event.target.value);
            }}
          >
            {workspaceOptions.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </Field>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({
  label,
  children,
  helperText,
  error,
}: {
  label: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
