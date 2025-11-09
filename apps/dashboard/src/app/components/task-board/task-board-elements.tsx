import { memo } from "react";
import {
  Inbox,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Task {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Normal";
  assignees: string[];
}

export interface TaskSection {
  title: string;
  count: number;
  accent: string;
  tasks: Task[];
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function TaskSectionHeader({
  title,
  count,
  accentClass,
}: {
  title: string;
  count: number;
  accentClass: string;
}) {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className={cn("h-6 w-1.5 rounded-full", accentClass)} />
      <span>{title}</span>
      <span className="mx-2 rounded-md bg-muted px-3 py-1 text-base font-medium">
        {count}
      </span>
    </div>
  );
}

export function TaskTableHeader() {
  const columns = ["Task", "Description", "Priority", "Assignee", "Action"];
  return (
    <div className="grid grid-cols-[2fr_3fr_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 rounded-lg border border-border/40 bg-border px-4 py-3 text-md tracking-wide text-muted-foreground">
      {columns.map((column) => (
        <span
          key={column}
          className={column === "Action" ? "text-center" : undefined}
        >
          {column}
        </span>
      ))}
    </div>
  );
}

const PRIORITY_STYLES: Record<
  Task["priority"],
  { badge: string; icon: typeof SignalHigh }
> = {
  High: {
    badge: "bg-red-500/5 border border-red-500/20",
    icon: SignalHigh,
  },
  Medium: {
    badge: "bg-amber-500/10",
    icon: SignalMedium,
  },
  Normal: {
    badge: "bg-emerald-500/10",
    icon: SignalLow,
  },
};

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const { badge, icon: Icon } = PRIORITY_STYLES[priority];
  return (
    <span
      className={cn(
        "inline-flex max-w-fit w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium",
        badge,
      )}
    >
      <Icon className="h-5 w-6" />
      {priority}
    </span>
  );
}

function AssigneeStack({ assignees }: { assignees: string[] }) {
  return (
    <div className="flex">
      {assignees.map((initials, index) => (
        <span
          key={`${initials}-${index}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-background bg-muted text-xs font-semibold text-foreground shadow"
          style={{
            marginLeft: index === 0 ? 0 : -8,
            zIndex: assignees.length - index,
          }}
        >
          {initials}
        </span>
      ))}
    </div>
  );
}

export interface TaskRowProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

function TaskRowComponent({ task, onEdit }: TaskRowProps) {
  return (
    <div className="grid grid-cols-[2fr_3fr_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 ">
      <div className="flex items-center gap-2">
        <span className="text-accent-foreground">⋮⋮</span>
        <span className="font-medium text-foreground">{task.title}</span>
      </div>
      <p>{task.description}</p>
      <div className="flex">
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="flex">
        <AssigneeStack assignees={task.assignees} />
      </div>
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => onEdit?.(task)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

export const TaskRow = memo(TaskRowComponent);

export function TablePaginationControls({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
}) {
  const isFirstPage = page <= 0;
  const isLastPage = page >= pageCount - 1;

  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
      <span>
        Page {page + 1} of {pageCount}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => !isFirstPage && onPageChange(page - 1)}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => !isLastPage && onPageChange(page + 1)}
          disabled={isLastPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
