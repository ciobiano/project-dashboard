"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { TaskSection } from "@/types/task-board";

import {
  useTaskBoardState,
  type CreateTaskInput,
} from "@/hooks/use-task-board-state";
import { QuickActionCards } from "./task-board/quick-action-cards";
import {
  BoardTabs,
  DEFAULT_PAGE_SIZE,
  EmptyState,
  PaginatedTaskSection,
  TaskRowPreview,
  boardTabs,
} from "./task-board/task-board-view";

interface TaskBoardProps {
  className?: string;
}

const INITIAL_SECTIONS: TaskSection[] = [
  {
    id: "todo",
    title: "To Do Task",
    accent: "bg-amber-400",
    tasks: [
      {
        id: "todo-redesign-homepage",
        title: "Redesign Homepage Layout",
        description: "Rework the homepage hero section and navigation flow.",
        priority: "High",
        assignees: ["AL", "MB", "+1"],
        status: "todo",
        order: 0,
      },
      {
        id: "todo-update-product-detail",
        title: "Update Product Detail Page",
        description:
          "Add detailed product imagery and improve specification tabs.",
        priority: "High",
        assignees: ["TS", "RM"],
        status: "todo",
        order: 1,
      },
      {
        id: "todo-optimize-checkout",
        title: "Optimize Checkout Flow",
        description: "Reduce steps and surface saved payment methods.",
        priority: "Medium",
        assignees: ["DL", "JP"],
        status: "todo",
        order: 2,
      },
      {
        id: "todo-add-wishlist",
        title: "Add Wishlist Feature",
        description: "Let customers save products for later comparisons.",
        priority: "Medium",
        assignees: ["AN", "KS"],
        status: "todo",
        order: 3,
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress Task",
    accent: "bg-sky-400",
    tasks: [
      {
        id: "in-progress-mobile-responsive",
        title: "Improve Mobile Responsiveness",
        description: "Tighten spacing across breakpoints and re-test layouts.",
        priority: "Medium",
        assignees: ["AL", "MB"],
        status: "in-progress",
        order: 0,
      },
      {
        id: "in-progress-stripe",
        title: "Integrate Stripe Payment Gateway",
        description: "Wire up Stripe API with seamless subscription billing.",
        priority: "High",
        assignees: ["TS", "RM", "DL"],
        status: "in-progress",
        order: 1,
      },
      {
        id: "in-progress-search-optimization",
        title: "Product Search Optimization",
        description: "Enhance query relevance and auto-complete suggestions.",
        priority: "Medium",
        assignees: ["JP", "KS"],
        status: "in-progress",
        order: 2,
      },
      {
        id: "in-progress-seo",
        title: "Set Up SEO & Meta Tags",
        description: "Implement essential tags for each product template.",
        priority: "Normal",
        assignees: ["AN", "DL"],
        status: "in-progress",
        order: 3,
      },
    ],
  },
];

export function TaskBoard({ className }: TaskBoardProps) {
  const [sectionPages, setSectionPages] = useState<Record<string, number>>(() =>
    Object.fromEntries(INITIAL_SECTIONS.map(({ id }) => [id, 0])),
  );
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null,
  );

  const {
    sections,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    createTask,
  } = useTaskBoardState({ initialSections: INITIAL_SECTIONS });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const goToPage = (sectionId: string, nextPage: number) => {
    setSectionPages((prev) => ({
      ...prev,
      [sectionId]: nextPage,
    }));
  };

  const handleTaskCreate = useCallback(
    async (input: CreateTaskInput) => {
      const created = await createTask(input);
      setSectionPages((previous) => ({
        ...previous,
        [created.status]: 0,
      }));
      setHighlightedTaskId(created.id);
      return created;
    },
    [createTask],
  );

  useEffect(() => {
    if (!highlightedTaskId) {
      return;
    }
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    const focusRow = () => {
      const row = document.getElementById(`task-${highlightedTaskId}`);
      if (row instanceof HTMLElement) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.focus({ preventScroll: true });
      }
    };
    const frame = window.requestAnimationFrame(focusRow);
    const timeout = window.setTimeout(() => {
      setHighlightedTaskId(null);
    }, 2400);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [highlightedTaskId]);

  return (
    <div className={cn("col-span-4", className)}>
      <QuickActionCards
        sections={sections}
        onCreateTask={handleTaskCreate}
        className="mb-8"
      />
      <Tabs defaultValue="overview" className="space-y-10">
        <BoardTabs tabs={boardTabs} />

        <TabsContent value="overview" className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {sections.map((section) => {
              return (
                <PaginatedTaskSection
                  key={section.id}
                  section={section}
                  page={sectionPages[section.id] ?? 0}
                  pageSize={DEFAULT_PAGE_SIZE}
                  onPageChange={(nextPage) => goToPage(section.id, nextPage)}
                  highlightTaskId={highlightedTaskId}
                />
              );
            })}
            <DragOverlay dropAnimation={null}>
              {activeTask ? <TaskRowPreview task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="workflow">
          <EmptyState
            title="Workflow board is empty"
            description="Automations and approvals show here once you connect a project workflow."
          />
        </TabsContent>
        <TabsContent value="board">
          <EmptyState
            title="No board data yet"
            description="Create a sprint board or import from Jira/Trello to populate this tab."
          />
        </TabsContent>
        <TabsContent value="planner">
          <EmptyState
            title="Planner setup pending"
            description="Schedule milestones and assign owners to visualize your planning timeline."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
