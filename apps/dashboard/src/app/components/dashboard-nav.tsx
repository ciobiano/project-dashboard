"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronsUpDown,
  CornerDownRight,
  FileText,
  Folder,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  Package2,
  PieChart,
  Plus,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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

const clientProjects = [
  "Brand Identity Refresh",
  "Crypto Mobile App",
  "E-Commerce Revamp",
  "AI Agent Dashboard",
];

export function DashboardNav() {
  return (
    <Sidebar className="bg-white text-slate-900 dark:bg-sidebar dark:text-white">
      <SidebarHeader className="border-b border-slate-200 px-4 py-5 dark:border-white/5">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:bg-accent">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-slate-900">
            <Package2 className="h-6 w-6" />
          </div>
          <div className="flex-1 ">
            <p className=" text-slate-500 dark:text-white/70">
              Workspace
            </p>
            <div className="flex items-center justify-between gap-2 text-base font-semibold">
              Project Team
              <ChevronsUpDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
            </div>
          </div>
        </div>
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
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5">
                <Folder className="h-4 w-4" />
                Product Launch
              </button>

              <div className="rounded-2xl">
                <div className="flex items-center justify-between rounded-xl bg-slate-900/5 px-3 py-2 text-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.05)] dark:bg-accent dark:text-white dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-3">
                    <Folder className="h-4 w-4" />
                    Client Projects
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
                </div>
                <div className="mt-2 space-y-1 pl-2">
                  {clientProjects.map((project) => (
                    <button
                      key={project}
                      className="group flex w-full items-center gap-1 rounded-xl px-3 py-1.5 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5"
                    >
                      <CornerDownRight className="h-3.5 w-3.5 text-slate-400 dark:text-white/50" />
                      <FileText className="h-4 w-4 text-slate-500 dark:text-white/60" />
                      <span
                        className={
                          project === "E-Commerce Revamp"
                            ? "text-slate-900 dark:text-white"
                            : undefined
                        }
                      >
                        {project}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5">
                <Folder className="h-4 w-4" />
                Website Redesign
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5">
                <Folder className="h-4 w-4" />
                Marketing Sprint
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5">
                <Plus className="h-4 w-4" />
                New Folder
              </button>
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
                8
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  Kree8 Studio
                </p>
                <p className="text-xs text-slate-500 dark:text-white/70">
                  kree8studio@gmail.com
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
