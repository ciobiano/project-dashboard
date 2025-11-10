import { useEffect, useMemo, useRef, useState } from "react";

import { useWorkspaces } from "@/hooks/use-workspaces";
import type { WorkspaceSummary } from "@/types/workspace";

const WORKSPACE_STORAGE_KEY = "sidebar:selected-workspace";

interface UseSelectedWorkspaceOptions {
  defaultWorkspaceId: string;
}

export function useSelectedWorkspace({
  defaultWorkspaceId,
}: UseSelectedWorkspaceOptions) {
  const workspacesQuery = useWorkspaces();
  const workspaces = workspacesQuery.data?.workspaces ?? [];

  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    if (!workspaces.length) {
      return;
    }

    let nextWorkspaceId: string | null = null;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (stored && workspaces.some((workspace) => workspace.id === stored)) {
        nextWorkspaceId = stored;
      }
    }

    if (!nextWorkspaceId) {
      const fallback =
        workspaces.find((workspace) => workspace.id === defaultWorkspaceId) ??
        workspaces[0];
      nextWorkspaceId = fallback?.id ?? defaultWorkspaceId;
    }

    setWorkspaceId(nextWorkspaceId);
    initializedRef.current = true;
  }, [defaultWorkspaceId, workspaces]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }
    if (!workspaces.length) {
      return;
    }
    const exists = workspaces.some(
      (workspace) => workspace.id === workspaceId
    );
    if (!exists) {
      setWorkspaceId(
        workspaces[0]?.id ?? defaultWorkspaceId
      );
    }
  }, [workspaceId, workspaces, defaultWorkspaceId]);

  const activeWorkspace: WorkspaceSummary | null = useMemo(() => {
    return (
      workspaces.find((workspace) => workspace.id === workspaceId) ?? null
    );
  }, [workspaces, workspaceId]);

  return {
    workspaces,
    workspaceId,
    selectWorkspace: setWorkspaceId,
    activeWorkspace,
    query: workspacesQuery,
  };
}
