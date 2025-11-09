"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import {
  BoardTabs,
  DEFAULT_PAGE_SIZE,
  EmptyState,
  PaginatedTaskSection,
  boardTabs,
} from "./task-board/task-board-view";
import type { TaskSection } from "./task-board/task-board-view";

const sections: TaskSection[] = [
  {
    title: "To Do Task",
    count: 4,
    accent: "bg-amber-400",
    tasks: [
      {
        title: "Redesign Homepage Layout",
        description: "Rework the homepage hero section and navigation flow.",
        priority: "High",
        assignees: ["AL", "MB", "+1"],
      },
      {
        title: "Update Product Detail Page",
        description:
          "Add detailed product imagery and improve specification tabs.",
        priority: "High",
        assignees: ["TS", "RM"],
      },
      {
        title: "Optimize Checkout Flow",
        description: "Reduce steps and surface saved payment methods.",
        priority: "Medium",
        assignees: ["DL", "JP"],
      },
      {
        title: "Add Wishlist Feature",
        description: "Let customers save products for later comparisons.",
        priority: "Medium",
        assignees: ["AN", "KS"],
      },
    ],
  },
  {
    title: "In Progress Task",
    count: 4,
    accent: "bg-sky-400",
    tasks: [
      {
        title: "Improve Mobile Responsiveness",
        description: "Tighten spacing across breakpoints and re-test layouts.",
        priority: "Medium",
        assignees: ["AL", "MB"],
      },
      {
        title: "Integrate Stripe Payment Gateway",
        description: "Wire up Stripe API with seamless subscription billing.",
        priority: "High",
        assignees: ["TS", "RM", "DL"],
      },
      {
        title: "Product Search Optimization",
        description: "Enhance query relevance and auto-complete suggestions.",
        priority: "Medium",
        assignees: ["JP", "KS"],
      },
      {
        title: "Set Up SEO & Meta Tags",
        description: "Implement essential tags for each product template.",
        priority: "Normal",
        assignees: ["AN", "DL"],
      },
    ],
  },
];

interface TaskBoardProps {
  className?: string;
}

export function TaskBoard({ className }: TaskBoardProps) {
  const [sectionPages, setSectionPages] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      sections.map(({ title }) => [title, 0]),
    ) as Record<string, number>,
  );

  const goToPage = (sectionTitle: string, nextPage: number) => {
    setSectionPages((prev) => ({
      ...prev,
      [sectionTitle]: nextPage,
    }));
  };

  return (
    <div className={cn(" col-span-4", className)}>
      <Tabs defaultValue="overview" className="space-y-10">
        <BoardTabs tabs={boardTabs} />

        <TabsContent value="overview" className="space-y-6">
          {sections.map((section) => {
            const { title } = section;
            return (
              <PaginatedTaskSection
                key={title}
                section={section}
                page={sectionPages[title] ?? 0}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={(nextPage) => goToPage(title, nextPage)}
              />
            );
          })}
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
