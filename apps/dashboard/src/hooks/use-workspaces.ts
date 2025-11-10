import { useQuery } from "@tanstack/react-query";

import type { WorkspaceSummary } from "@/types/workspace";

interface WorkspacesResponse {
  workspaces: WorkspaceSummary[];
}

async function fetchWorkspaces() {
  const response = await fetch("/api/workspaces");
  if (!response.ok) {
    throw new Error("Unable to load workspaces");
  }
  return (await response.json()) as WorkspacesResponse;
}

export function useWorkspaces() {
  return useQuery<WorkspacesResponse, Error>({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    staleTime: 5 * 60 * 1000,
  });
}
