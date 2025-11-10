import { useQuery } from "@tanstack/react-query";

import { WorkspaceTreeResponse } from "@/types/workspace";

async function fetchWorkspaceTree(workspaceId: string) {
  const response = await fetch(`/api/workspaces/${workspaceId}/tree`);
  if (!response.ok) {
    throw new Error("Unable to load workspace data");
  }
  return (await response.json()) as WorkspaceTreeResponse;
}

export function useWorkspaceTree(workspaceId: string) {
  return useQuery<WorkspaceTreeResponse, Error>({
    queryKey: ["workspace-tree", workspaceId],
    queryFn: () => fetchWorkspaceTree(workspaceId),
    staleTime: 60 * 1000,
  });
}
