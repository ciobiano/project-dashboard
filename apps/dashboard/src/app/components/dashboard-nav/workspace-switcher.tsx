"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronsUpDown, Package2 } from "lucide-react";

import type { WorkspaceSummary } from "@/types/workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string;
  label?: string;
  isLoading?: boolean;
  onSelect: (workspaceId: string) => void;
  alignment?: "center" | "start";
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  label = "Workspace",
  isLoading = false,
  onSelect,
  alignment = "center",
}: WorkspaceSwitcherProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const activeWorkspace = useMemo(() => {
    return (
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
      null
    );
  }, [activeWorkspaceId, workspaces]);

  const workspaceName = activeWorkspace?.name ?? "Workspace";
  const workspaceSlug = activeWorkspace?.slug ?? "select-workspace";

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = useCallback(
    (workspaceId: string) => {
      onSelect(workspaceId);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl bg-slate-900/5 p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 dark:bg-accent dark:hover:bg-accent/80 dark:focus-visible:ring-white/40",
          alignment === "start" && "justify-start",
          alignment === "center" && "justify-between"
        )}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-slate-900">
          <Package2 className="h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col text-base font-semibold">
          <span className="text-slate-500 dark:text-white/70">{label}</span>
          <span className="text-slate-900 dark:text-white">{workspaceName}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-sidebar dark:text-white">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : workspaces.length ? (
            <div className="space-y-1">
              {workspaces.map((workspace) => {
                const isActive = workspace.id === activeWorkspaceId;
                const initials = workspace.name
                  .split(" ")
                  .map((value) => value[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() => handleSelect(workspace.id)}
                    data-active={isActive}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 dark:hover:bg-white/5 dark:focus-visible:ring-white/40 data-[active=true]:bg-slate-900/10 dark:data-[active=true]:bg-white/10"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/5 text-sm font-semibold dark:bg-white/10">
                      {initials}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {workspace.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-white/60">
                        {workspace.slug}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-100 px-3 py-2 text-center text-xs text-slate-500 dark:bg-white/10 dark:text-white/60">
              No workspaces available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
