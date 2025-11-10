export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectNode {
  id: string;
  folderId: string;
  name: string;
  order: number;
  description?: string;
}

export interface FolderNode {
  id: string;
  workspaceId: string;
  name: string;
  order: number;
  projects: ProjectNode[];
}

export interface WorkspaceTreeResponse {
  workspace: WorkspaceSummary;
  folders: FolderNode[];
}
