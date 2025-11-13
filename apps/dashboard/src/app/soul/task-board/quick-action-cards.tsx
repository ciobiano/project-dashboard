"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/toast";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceTree } from "@/hooks/use-workspace-tree";
import { useCreateFolder } from "@/hooks/use-create-folder";
import type { Task, TaskSection } from "@/types/task-board";
import type {
  WorkspaceSummary,
  WorkspaceTreeResponse,
} from "@/types/workspace";
import type { CreateTaskInput } from "@/hooks/use-task-board-state";

import { cn } from "@/lib/utils";
import { QuickActionCard } from "./quick-action-card";
import {
  FolderActionDialog,
  ProjectActionDialog,
  TaskActionDialog,
  folderSchema,
  projectSchema,
  taskSchema,
  type FolderFormValues,
  type ProjectFormValues,
  type StatusOption,
  type TaskFormValues,
} from "./quick-action-dialogs";

const DEFAULT_WORKSPACES: WorkspaceSummary[] = [
  { id: "ws_acme-ops", name: "Acme Operations", slug: "acme-ops" },
  { id: "ws_kree8", name: "Kree8 Studio", slug: "kree8" },
];

interface QuickActionCardsProps {
  sections: TaskSection[];
  onCreateTask: (input: CreateTaskInput) => Promise<Task>;
  className?: string;
}

export function QuickActionCards({
  sections,
  onCreateTask,
  className,
}: QuickActionCardsProps) {
  const { toast } = useToast();
  const workspaceQuery = useWorkspaces();
  const workspaceOptions =
    workspaceQuery.data?.workspaces?.length
      ? workspaceQuery.data.workspaces
      : DEFAULT_WORKSPACES;

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const [projectWorkspaceId, setProjectWorkspaceId] = useState<string | null>(
    null,
  );
  const [folderWorkspaceId, setFolderWorkspaceId] = useState<string | null>(
    null,
  );

  const queryClient = useQueryClient();
  const createFolderMutation = useCreateFolder();

  const statusOptions = useMemo<StatusOption[]>(
    () =>
      sections.map((section) => ({
        value: section.id,
        label: section.title,
      })),
    [sections],
  );

  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignees: "",
      priority: "High",
      status: statusOptions[0]?.value ?? "",
    },
  });

  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      workspaceId: workspaceOptions[0]?.id ?? "",
      folderId: "",
    },
  });

  const folderForm = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      workspaceId: workspaceOptions[0]?.id ?? "",
    },
  });

  const projectWorkspaceFallback = workspaceOptions[0]?.id ?? "ws_acme-ops";
  const folderWorkspaceFallback = workspaceOptions[0]?.id ?? "ws_acme-ops";

  const effectiveProjectWorkspaceId =
    projectWorkspaceId ?? projectWorkspaceFallback;
  const effectiveFolderWorkspaceId =
    folderWorkspaceId ?? folderWorkspaceFallback;

  const projectWorkspaceTreeQuery = useWorkspaceTree(
    effectiveProjectWorkspaceId,
  );
  const projectFolderOptions = projectWorkspaceTreeQuery.data?.folders ?? [];

  useEffect(() => {
    if (statusOptions.length === 0) {
      return;
    }
    const current = taskForm.getValues("status");
    if (!current) {
      taskForm.setValue("status", statusOptions[0].value);
    }
  }, [statusOptions, taskForm]);

  useEffect(() => {
    if (!projectWorkspaceId && projectWorkspaceFallback) {
      setProjectWorkspaceId(projectWorkspaceFallback);
    }
  }, [projectWorkspaceFallback, projectWorkspaceId]);

  useEffect(() => {
    if (!folderWorkspaceId && folderWorkspaceFallback) {
      setFolderWorkspaceId(folderWorkspaceFallback);
    }
  }, [folderWorkspaceFallback, folderWorkspaceId]);

  useEffect(() => {
    if (!effectiveProjectWorkspaceId) {
      return;
    }
    const current = projectForm.getValues("workspaceId");
    if (current !== effectiveProjectWorkspaceId) {
      projectForm.setValue("workspaceId", effectiveProjectWorkspaceId);
    }
  }, [effectiveProjectWorkspaceId, projectForm]);

  useEffect(() => {
    if (!effectiveFolderWorkspaceId) {
      return;
    }
    const current = folderForm.getValues("workspaceId");
    if (current !== effectiveFolderWorkspaceId) {
      folderForm.setValue("workspaceId", effectiveFolderWorkspaceId);
    }
  }, [effectiveFolderWorkspaceId, folderForm]);

  useEffect(() => {
    if (!projectFolderOptions.length) {
      projectForm.setValue("folderId", "");
      return;
    }
    const current = projectForm.getValues("folderId");
    if (
      !current ||
      !projectFolderOptions.some((folder) => folder.id === current)
    ) {
      projectForm.setValue("folderId", projectFolderOptions[0].id);
    }
  }, [projectFolderOptions, projectForm]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (isTypingTarget(target)) return;
      const key = event.key.toLowerCase();
      if (key === "n") {
        event.preventDefault();
        setTaskDialogOpen(true);
      } else if (key === "p") {
        event.preventDefault();
        setProjectDialogOpen(true);
      } else if (key === "f") {
        event.preventDefault();
        setFolderDialogOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleTaskSubmit = taskForm.handleSubmit(async (values) => {
    if (!statusOptions.length) {
      toast({
        title: "Add a status column first",
        description: "Tasks need at least one section to land in.",
        variant: "destructive",
      });
      return;
    }
    const payload: CreateTaskInput = {
      title: values.title.trim(),
      description: values.description?.trim() ?? "",
      priority: values.priority,
      status: values.status,
      assignees: normalizeAssignees(values.assignees ?? ""),
    };
    try {
      const created = await onCreateTask(payload);
      toast({
        title: "Task created",
        description: `"${created.title}" added to ${getStatusLabel(
          created.status,
          statusOptions,
        )}.`,
      });
      taskForm.reset({
        title: "",
        description: "",
        assignees: "",
        priority: values.priority,
        status: created.status,
      });
      setTaskDialogOpen(false);
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Unable to add task.";
      toast({
        title: "Could not create task",
        description,
        variant: "destructive",
      });
    }
  });

  const handleProjectSubmit = projectForm.handleSubmit(async (values) => {
    const foldersForWorkspace =
      queryClient.getQueryData<WorkspaceTreeResponse>([
        "workspace-tree",
        values.workspaceId,
      ])?.folders ?? projectFolderOptions;
    const targetFolder = foldersForWorkspace.find(
      (folder) => folder.id === values.folderId,
    );
    if (!targetFolder) {
      toast({
        title: "Select a folder",
        description: "Choose where the project should live.",
        variant: "destructive",
      });
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      const nextOrder =
        targetFolder.projects.reduce(
          (max, project) => Math.max(max, project.order),
          0,
        ) + 1;
      const newProject = {
        id: `prj_${Date.now().toString(36)}`,
        folderId: targetFolder.id,
        name: values.name.trim(),
        order: nextOrder,
        description: values.description?.trim() || undefined,
      };

      queryClient.setQueryData<WorkspaceTreeResponse | undefined>(
        ["workspace-tree", values.workspaceId],
        (existing) => {
          if (!existing) {
            return existing;
          }
          return {
            ...existing,
            folders: existing.folders.map((folder) =>
              folder.id === newProject.folderId
                ? {
                    ...folder,
                    projects: [...folder.projects, newProject],
                  }
                : folder,
            ),
          };
        },
      );

      toast({
        title: "Project created",
        description: `"${newProject.name}" added under ${targetFolder.name}.`,
      });
      projectForm.reset({
        name: "",
        description: "",
        workspaceId: values.workspaceId,
        folderId: values.folderId,
      });
      setProjectDialogOpen(false);
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Unable to create project.";
      toast({
        title: "Could not create project",
        description,
        variant: "destructive",
      });
    }
  });

  const handleFolderSubmit = folderForm.handleSubmit(async (values) => {
    try {
      await createFolderMutation.mutateAsync({
        workspaceId: values.workspaceId,
        name: values.name.trim(),
      });
      toast({
        title: "Folder created",
        description: `"${values.name}" added to workspace.`,
      });
      folderForm.reset({
        name: "",
        workspaceId: values.workspaceId,
      });
      setFolderDialogOpen(false);
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Unable to create folder.";
      toast({
        title: "Could not create folder",
        description,
        variant: "destructive",
      });
    }
  });

  const cardConfig = [
    {
      key: "task",
      title: "Create New Task",
      description: "Capture work with owners, priority, and status.",
      iconSrc: "/icons/Tick.svg",
      iconAlt: "Tick icon",
      isOpen: taskDialogOpen,
      onOpenChange: setTaskDialogOpen,
      dialog: (
        <TaskActionDialog
          form={taskForm}
          statusOptions={statusOptions}
          onSubmit={handleTaskSubmit}
          onCancel={() => setTaskDialogOpen(false)}
        />
      ),
    },
    {
      key: "project",
      title: "Create New Project",
      description: "Spin up a project under any folder.",
      iconSrc: "/icons/Calendar.svg",
      iconAlt: "Calendar icon",
      isOpen: projectDialogOpen,
      onOpenChange: setProjectDialogOpen,
      dialog: (
        <ProjectActionDialog
          form={projectForm}
          workspaceOptions={workspaceOptions}
          folderOptions={projectFolderOptions.map((folder) => ({
            id: folder.id,
            name: folder.name,
          }))}
          onWorkspaceChange={setProjectWorkspaceId}
          onSubmit={handleProjectSubmit}
          onCancel={() => setProjectDialogOpen(false)}
        />
      ),
    },
    {
      key: "folder",
      title: "Create New Folder",
      description: "Organize workstreams by folder and share with teams.",
      iconSrc: "/icons/Folder.svg",
      iconAlt: "Folder icon",
      isOpen: folderDialogOpen,
      onOpenChange: setFolderDialogOpen,
      dialog: (
        <FolderActionDialog
          form={folderForm}
          workspaceOptions={workspaceOptions}
          onWorkspaceChange={setFolderWorkspaceId}
          isCreating={createFolderMutation.isPending}
          onSubmit={handleFolderSubmit}
          onCancel={() => setFolderDialogOpen(false)}
        />
      ),
    },
    {
      key: "sessions",
      title: "Active Sessions",
      description: "Monitor active collaborators in real time.",
      iconSrc: "/icons/Activity.svg",
      iconAlt: "Activity icon",
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {cardConfig.map((card) => (
        <QuickActionCard
          key={card.key}
          title={card.title}
          description={card.description}
          iconSrc={card.iconSrc}
          iconAlt={card.iconAlt}
          dialog={card.dialog}
          isOpen={card.isOpen}
          onOpenChange={card.onOpenChange}
        />
      ))}
    </div>
  );
}

function normalizeAssignees(rawValue: string) {
  const tokens = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) =>
      value
        .split(" ")
        .map((segment) => segment.trim()[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    )
    .filter(Boolean);

  if (tokens.length <= 3) {
    return tokens.length ? tokens : ["AL"];
  }

  const visible = tokens.slice(0, 2);
  const overflow = tokens.length - visible.length;
  return [...visible, `+${overflow}`];
}

function isTypingTarget(element: HTMLElement | null) {
  if (!element) return false;
  const tag = element.tagName;
  return (
    element.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

function getStatusLabel(
  statusId: string,
  options: Array<{ value: string; label: string }>,
) {
  return options.find((option) => option.value === statusId)?.label ?? "board";
}
