"use client";

import {
  AlertCircle,
  CalendarDays,
  ChevronsUpDown,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  PieChart,
  Settings,
} from "lucide-react";
import { useMemo } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceTree } from "./workspace-tree";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { NewFolderDialog } from "./new-folder-dialog";
import { useWorkspaceTree } from "@/hooks/use-workspace-tree";
import { useSelectedWorkspace } from "@/hooks/use-selected-workspace";
import { useCreateFolder } from "@/hooks/use-create-folder";

const mainMenu = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "#",
    active: true,
  },
  { label: "Inbox", icon: Mail, href: "#", badge: "12" },
  { label: "Stats", icon: PieChart, href: "#" },
  { label: "Calendar", icon: CalendarDays, href: "#" },
];

const DEFAULT_WORKSPACE_ID = "ws_acme-ops";

export function DashboardNav() {
  const {
    workspaces,
    workspaceId,
    selectWorkspace,
    activeWorkspace,
    query: workspacesQuery,
  } = useSelectedWorkspace({ defaultWorkspaceId: DEFAULT_WORKSPACE_ID });
  const { data, isLoading, isError, error } = useWorkspaceTree(workspaceId);
  const createFolder = useCreateFolder();

  const folders = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.folders]
      .sort((a, b) => a.order - b.order)
      .map((folder) => ({
        ...folder,
        projects: [...folder.projects].sort((a, b) => a.order - b.order),
      }));
  }, [data]);

  const currentWorkspaceSummary = activeWorkspace ?? data?.workspace ?? null;

  const workspaceName = currentWorkspaceSummary?.name ?? "Workspace";
  const workspaceSlug = currentWorkspaceSummary?.slug ?? "select-workspace";
  const workspaceInitials = workspaceName
    .split(" ")
    .map((value) => value[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar className="bg-white text-slate-900 dark:bg-sidebar dark:text-white">
      <SidebarHeader className="border-b border-slate-200 px-4 py-5 dark:border-white/5">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={workspaceId}
          onSelect={selectWorkspace}
          isLoading={workspacesQuery.isLoading}
        />
      </SidebarHeader>

      <SidebarContent className="flex flex-1 flex-col justify-between">
        <div className="space-y-6 px-3 py-5 text-sm text-slate-600 dark:text-white/80">
          <div className="space-y-2">
            <p className="px-3 text-[12px] font-semibold uppercase text-slate-400 dark:text-white/30">
              Main Menu
            </p>
            <SidebarMenu className="gap-1">
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    className="group h-11 rounded-xl border border-transparent bg-transparent px-3 text-base text-slate-600 transition hover:border-slate-200 hover:bg-slate-900/5 data-[active=true]:border-slate-200 data-[active=true]:bg-slate-900/10 data-[active=true]:text-slate-900 dark:text-white/80 dark:hover:border-white/10 dark:hover:bg-white/5 dark:data-[active=true]:border-black dark:data-[active=true]:bg-accent dark:data-[active=true]:text-white"
                  >
                    <a
                      href={item.href}
                      className="flex w-full items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-xs text-slate-900 dark:bg-white/10 dark:text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>

          <div className="space-y-3">
            <p className="px-3 text-[12px] font-semibold uppercase text-slate-400 dark:text-white/30">
              Folder
            </p>
            <div className="space-y-1 text-slate-600 dark:text-white/70">
              {isLoading && (
                <div className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              )}
              {isError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error?.message ?? "Failed to load workspace."}</span>
                </div>
              )}
              {!isLoading && !isError && (
                <WorkspaceTree
                  workspaceId={workspaceId}
                  folders={folders}
                />
              )}
              <NewFolderDialog
                onCreate={(name) =>
                  createFolder.mutateAsync({ workspaceId, name })
                }
                isCreating={createFolder.isPending}
              />
            </div>
          </div>
        </div>

        <SidebarFooter className="space-y-4 border-t border-slate-100 px-3 py-4 text-sm text-slate-500 dark:border-white/5 dark:text-white/70">
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5">
              <MessagesSquare className="h-4 w-4" />
              Help & Support
            </button>
          </div>

          <div className="-mb-2 rounded-2xl border border-slate-200 p-3 text-slate-700 dark:border-white/5 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/5 text-2xl font-semibold dark:bg-black/30">
                {workspaceInitials || "WS"}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {workspaceName}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/70">
                  {workspaceSlug}@example.com
                </p>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400 dark:text-white/60" />
            </div>
          </div>
          <p className="flex justify-center text-center text-[12px] uppercase text-slate-400 dark:text-white/40">
            © 2025 Design
          </p>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
