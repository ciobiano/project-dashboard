"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { CornerDownRight, FileText, Folder } from "lucide-react";

import type { FolderNode } from "@/types/workspace";
import { cn } from "@/lib/utils";

type TreeNodeType = "folder" | "project";

type TreeNode = {
  id: string;
  label: string;
  type: TreeNodeType;
  depth: number;
  parentId: string | null;
  childIds: string[];
};

interface WorkspaceTreeProps {
  workspaceId: string;
  folders: Array<
    FolderNode & {
      projects: FolderNode["projects"];
    }
  >;
}

export function WorkspaceTree({ workspaceId, folders }: WorkspaceTreeProps) {
  const treeMetadata = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>();
    const folderSequence: { id: string; projectIds: string[] }[] = [];
    folders.forEach((folder) => {
      const projectIds = folder.projects.map((project) => project.id);
      folderSequence.push({ id: folder.id, projectIds });
      nodeMap.set(folder.id, {
        id: folder.id,
        label: folder.name,
        type: "folder",
        depth: 1,
        parentId: null,
        childIds: projectIds,
      });
      folder.projects.forEach((project) => {
        nodeMap.set(project.id, {
          id: project.id,
          label: project.name,
          type: "project",
          depth: 2,
          parentId: folder.id,
          childIds: [],
        });
      });
    });
    return { nodeMap, folderSequence };
  }, [folders]);

  const expandedStorageKey = `sidebar:${workspaceId}:expanded-folders`;
  const selectedStorageKey = `sidebar:${workspaceId}:selected-node`;

  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [expandedInitialized, setExpandedInitialized] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedInitialized, setSelectedInitialized] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setExpandedInitialized(false);
    setSelectedInitialized(false);
    setExpandedFolders([]);
    setSelectedNodeId(null);
    setFocusedNodeId(null);
  }, [expandedStorageKey, selectedStorageKey]);

  useEffect(() => {
    if (expandedInitialized || folders.length === 0) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = window.localStorage.getItem(expandedStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setExpandedFolders(
          parsed.filter((folderId) => treeMetadata.nodeMap.has(folderId))
        );
      } else {
        setExpandedFolders(folders.map((folder) => folder.id));
      }
    } catch (err) {
      console.warn("Failed to parse sidebar expanded state", err);
      setExpandedFolders(folders.map((folder) => folder.id));
    } finally {
      setExpandedInitialized(true);
    }
  }, [expandedInitialized, expandedStorageKey, folders, treeMetadata.nodeMap]);

  useEffect(() => {
    if (!expandedInitialized || typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(
        expandedStorageKey,
        JSON.stringify(expandedFolders)
      );
    } catch (err) {
      console.warn("Unable to persist sidebar expanded state", err);
    }
  }, [expandedFolders, expandedInitialized, expandedStorageKey]);

  const expandFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev : [...prev, folderId]
    );
  }, []);

  const collapseFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) =>
      prev.filter((existing) => existing !== folderId)
    );
  }, []);

  useEffect(() => {
    if (selectedInitialized || treeMetadata.nodeMap.size === 0) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }

    let nextSelected: string | null = null;
    try {
      const stored = window.localStorage.getItem(selectedStorageKey);
      if (stored && treeMetadata.nodeMap.has(stored)) {
        nextSelected = stored;
      }
    } catch (err) {
      console.warn("Failed to parse selected node state", err);
    }

    if (!nextSelected) {
      nextSelected =
        treeMetadata.folderSequence[0]?.projectIds[0] ??
        treeMetadata.folderSequence[0]?.id ??
        null;
    }

    if (nextSelected) {
      const node = treeMetadata.nodeMap.get(nextSelected);
      if (node?.parentId) {
        expandFolder(node.parentId);
      }
    }

    setSelectedNodeId(nextSelected);
    setFocusedNodeId(nextSelected);
    setSelectedInitialized(true);
  }, [
    expandFolder,
    selectedInitialized,
    selectedStorageKey,
    treeMetadata.folderSequence,
    treeMetadata.nodeMap,
  ]);

  useEffect(() => {
    if (!selectedInitialized || typeof window === "undefined") {
      return;
    }
    if (!selectedNodeId) {
      window.localStorage.removeItem(selectedStorageKey);
      return;
    }
    window.localStorage.setItem(selectedStorageKey, selectedNodeId);
  }, [selectedInitialized, selectedNodeId, selectedStorageKey]);

  useEffect(() => {
    if (!focusedNodeId) {
      return;
    }
    const ref = nodeRefs.current[focusedNodeId];
    if (ref) {
      ref.focus();
    }
  }, [focusedNodeId]);

  const expandedSet = useMemo(
    () => new Set(expandedFolders),
    [expandedFolders]
  );

  const visibleNodeIds = useMemo(() => {
    const ids: string[] = [];
    treeMetadata.folderSequence.forEach((folder) => {
      ids.push(folder.id);
      if (expandedSet.has(folder.id)) {
        ids.push(...folder.projectIds);
      }
    });
    return ids;
  }, [expandedSet, treeMetadata.folderSequence]);

  const tabStopId = focusedNodeId ?? visibleNodeIds[0] ?? null;

  const handleFolderToggle = useCallback((folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((existing) => existing !== folderId)
        : [...prev, folderId]
    );
  }, []);

  const handleSelection = useCallback(
    (nodeId: string) => {
      const node = treeMetadata.nodeMap.get(nodeId);
      if (!node) {
        return;
      }
      setSelectedNodeId(nodeId);
      setFocusedNodeId(nodeId);
      if (node.type === "project" && node.parentId) {
        expandFolder(node.parentId);
      }
    },
    [expandFolder, treeMetadata.nodeMap]
  );

  const handleNodeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, nodeId: string) => {
      const node = treeMetadata.nodeMap.get(nodeId);
      if (!node) {
        return;
      }
      const currentIndex = visibleNodeIds.indexOf(nodeId);
      const focusAt = (index: number) => {
        const nextId = visibleNodeIds[index];
        if (nextId) {
          setFocusedNodeId(nextId);
        }
      };

      switch (event.key) {
        case "ArrowDown": {
          if (currentIndex < visibleNodeIds.length - 1) {
            event.preventDefault();
            focusAt(currentIndex + 1);
          }
          break;
        }
        case "ArrowUp": {
          if (currentIndex > 0) {
            event.preventDefault();
            focusAt(currentIndex - 1);
          }
          break;
        }
        case "ArrowRight": {
          if (node.type === "folder") {
            if (!expandedSet.has(node.id) && node.childIds.length > 0) {
              event.preventDefault();
              expandFolder(node.id);
            } else if (node.childIds.length > 0) {
              event.preventDefault();
              setFocusedNodeId(node.childIds[0]);
            }
          }
          break;
        }
        case "ArrowLeft": {
          if (node.type === "folder") {
            if (expandedSet.has(node.id) && node.childIds.length > 0) {
              event.preventDefault();
              collapseFolder(node.id);
            }
          } else if (node.parentId) {
            event.preventDefault();
            setFocusedNodeId(node.parentId);
          }
          break;
        }
        case "[": {
          event.preventDefault();
          if (node.type === "folder") {
            collapseFolder(node.id);
          } else if (node.parentId) {
            collapseFolder(node.parentId);
          }
          break;
        }
        case "]": {
          event.preventDefault();
          const targetFolder =
            node.type === "folder" ? node.id : node.parentId;
          if (targetFolder) {
            expandFolder(targetFolder);
          }
          break;
        }
        default:
          break;
      }
    },
    [
      collapseFolder,
      expandFolder,
      expandedSet,
      treeMetadata.nodeMap,
      visibleNodeIds,
    ]
  );

  if (!folders.length) {
    return null;
  }

  return (
    <div role="tree" aria-label="Workspace folders" className="space-y-1">
      {folders.map((folder) => {
        const isExpanded = expandedSet.has(folder.id);
        const isSelected = selectedNodeId === folder.id;
        const isFocused = tabStopId === folder.id;

        return (
          <div key={folder.id} className="rounded-2xl">
            <button
              ref={(element) => {
                nodeRefs.current[folder.id] = element;
              }}
              type="button"
              onClick={() => {
                handleFolderToggle(folder.id);
                handleSelection(folder.id);
              }}
              onFocus={() => setFocusedNodeId(folder.id)}
              onKeyDown={(event) => handleNodeKeyDown(event, folder.id)}
              role="treeitem"
              aria-expanded={
                folder.projects.length ? isExpanded : undefined
              }
              aria-selected={isSelected}
              aria-level={1}
              tabIndex={isFocused ? 0 : -1}
              data-selected={isSelected}
              data-focused={isFocused}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-base transition hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 dark:hover:bg-white/5 dark:focus-visible:ring-white/40",
                "data-[selected=true]:bg-slate-900/10 data-[selected=true]:text-slate-900 dark:data-[selected=true]:bg-accent dark:data-[selected=true]:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <Folder className="h-4 w-4" />
                {folder.name}
              </span>
              <span className="text-[11px] uppercase text-slate-400 dark:text-white/40">
                {isExpanded ? "Hide" : "Show"}
              </span>
            </button>
            {isExpanded && folder.projects.length > 0 ? (
              <div
                role="group"
                className="mt-2 space-y-1 pl-2"
                aria-label={`${folder.name} projects`}
              >
                {folder.projects.map((project) => {
                  const projectSelected = selectedNodeId === project.id;
                  const projectFocused = tabStopId === project.id;
                  return (
                    <button
                      key={project.id}
                      ref={(element) => {
                        nodeRefs.current[project.id] = element;
                      }}
                      type="button"
                      onClick={() => handleSelection(project.id)}
                      onFocus={() => setFocusedNodeId(project.id)}
                      onKeyDown={(event) =>
                        handleNodeKeyDown(event, project.id)
                      }
                      role="treeitem"
                      aria-level={2}
                      aria-selected={projectSelected}
                      tabIndex={projectFocused ? 0 : -1}
                      data-selected={projectSelected}
                      data-focused={projectFocused}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-sm transition hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 dark:hover:bg-white/5 dark:focus-visible:ring-white/40",
                        "data-[selected=true]:bg-slate-900/10 data-[selected=true]:font-medium data-[selected=true]:text-slate-900 dark:data-[selected=true]:bg-accent dark:data-[selected=true]:text-white"
                      )}
                    >
                      <CornerDownRight className="h-3.5 w-3.5 text-slate-400 dark:text-white/50" />
                      <FileText className="h-4 w-4 text-slate-500 dark:text-white/60" />
                      <span>{project.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
