import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  FolderNode,
  WorkspaceTreeResponse,
} from "@/types/workspace";

interface CreateFolderPayload {
  workspaceId: string;
  name: string;
}

async function postFolder({ workspaceId, name }: CreateFolderPayload) {
  const response = await fetch(`/api/workspaces/${workspaceId}/folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Unable to create folder");
  }
  return (await response.json()) as FolderNode;
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postFolder,
    onSuccess: (newFolder, variables) => {
      queryClient.setQueryData<WorkspaceTreeResponse>(
        ["workspace-tree", variables.workspaceId],
        (existing) => {
          if (!existing) {
            return existing;
          }
          return {
            ...existing,
            folders: [...existing.folders, { ...newFolder, projects: [] }],
          };
        }
      );
    },
  });
}
