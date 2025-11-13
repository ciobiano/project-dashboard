import { Fragment, type ReactNode } from "react";
import {
  CalendarDays,
  GitBranch,
  KanbanSquare,
  LayoutDashboard,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TaskSection } from "@/types/task-board";

import {
  EmptyState,
  TablePaginationControls,
  TaskRow,
  TaskRowPreview,
  TaskSectionHeader,
  TaskTableHeader,
} from "./task-board-elements";

export const boardTabs = [
  { label: "Overview", icon: LayoutDashboard, value: "overview" },
  { label: "Workflow", icon: GitBranch, value: "workflow" },
  { label: "Board", icon: KanbanSquare, value: "board" },
  { label: "Planner", icon: CalendarDays, value: "planner" },
];

interface BoardTabOption {
  label: string;
  value: string;
  icon: typeof LayoutDashboard;
}

interface BoardTabsProps {
  tabs: BoardTabOption[];
  className?: string;
}

export function BoardTabs({ tabs, className }: BoardTabsProps) {
  return (
    <TabsList
      className={cn(
        "flex max-w-fit flex-wrap items-center gap-2 rounded-lg border border-black/40 bg-accent p-0 shadow-2xl",
        className,
      )}
    >
      {tabs.map(({ label, value, icon: Icon }, index) => (
        <Fragment key={value}>
          <TabsTrigger
            value={value}
            className="flex items-center gap-2 rounded-lg border border-transparent px-6 py-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
          {index < tabs.length - 1 && (
            <span aria-hidden="true" className="h-full w-px bg-border/90" />
          )}
        </Fragment>
      ))}
    </TabsList>
  );
}

export const DEFAULT_PAGE_SIZE = 5;

interface PaginatedTaskSectionProps {
  section: TaskSection;
  page: number;
  pageSize?: number;
  onPageChange: (nextPage: number) => void;
  onEditTask?: (task: TaskSection["tasks"][number]) => void;
  highlightTaskId?: string | null;
}

export function PaginatedTaskSection({
  section,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onEditTask,
  highlightTaskId,
}: PaginatedTaskSectionProps) {
  const totalPages = Math.max(1, Math.ceil(section.tasks.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * pageSize;
  const paginatedTasks = section.tasks.slice(start, start + pageSize);

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.max(0, Math.min(nextPage, totalPages - 1));
    if (clamped !== currentPage) {
      onPageChange(clamped);
    }
  };

  return (
    <section className="space-y-5">
      <TaskSectionHeader
        title={section.title}
        count={section.tasks.length}
        accentClass={section.accent}
      />
      <DroppableTaskList
        sectionId={section.id}
        tasks={paginatedTasks}
        className="overflow-hidden rounded-lg border border-border/60"
      >
        <TaskTableHeader />
        <div className="divide-y divide-border">
          <SortableContext
            id={section.id}
            items={paginatedTasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {paginatedTasks.map((task) => {
              const globalIndex = section.tasks.findIndex(
                (current) => current.id === task.id,
              );
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  isHighlighted={highlightTaskId === task.id}
                />
              );
            })}
          </SortableContext>
          {paginatedTasks.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No tasks on this page.
            </div>
          )}
        </div>
        <TablePaginationControls
          page={currentPage}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      </DroppableTaskList>
    </section>
  );
}

function DroppableTaskList({
  sectionId,
  tasks,
  className,
  children,
}: {
  sectionId: string;
  tasks: TaskSection["tasks"];
  className?: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: {
      type: "container",
      sectionId,
      empty: tasks.length === 0,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "overflow-hidden transition-all",
        isOver && "border border-dashed border-primary/60 bg-primary/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { EmptyState, TaskRowPreview } from "./task-board-elements";
export type { Task, TaskSection } from "@/types/task-board";
