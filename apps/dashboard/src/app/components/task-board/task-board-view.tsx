import { Fragment } from "react";
import {
  CalendarDays,
  GitBranch,
  KanbanSquare,
  LayoutDashboard,
} from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import {
  EmptyState,
  TablePaginationControls,
  TaskRow,
  TaskSection,
  TaskSectionHeader,
  TaskTableHeader,
} from "./task-board-elements";

export { EmptyState };
export type { Task, TaskSection } from "./task-board-elements";

export const DEFAULT_PAGE_SIZE = 5;

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

interface PaginatedTaskSectionProps {
  section: TaskSection;
  page: number;
  pageSize?: number;
  onPageChange: (nextPage: number) => void;
  onEditTask?: (task: TaskSection["tasks"][number]) => void;
}

export function PaginatedTaskSection({
  section,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onEditTask,
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
        count={section.count}
        accentClass={section.accent}
      />
      <div className="overflow-hidden">
        <TaskTableHeader />
        <div className="divide-y divide-border/30">
          {paginatedTasks.map((task) => (
            <TaskRow key={task.title} task={task} onEdit={onEditTask} />
          ))}
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
      </div>
    </section>
  );
}
