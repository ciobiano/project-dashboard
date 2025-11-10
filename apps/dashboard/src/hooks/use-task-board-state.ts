import { useCallback, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { useToast } from "@/components/ui/toast";

import type {
  BatchReorderPayload,
  DndData,
  Task,
  TaskSection,
} from "@/types/task-board";

interface UseTaskBoardStateParams {
  initialSections: TaskSection[];
}

interface UseTaskBoardStateResult {
  sections: TaskSection[];
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

export function useTaskBoardState({
  initialSections,
}: UseTaskBoardStateParams): UseTaskBoardStateResult {
  const [sections, setSections] = useState<TaskSection[]>(() =>
    cloneSections(initialSections),
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const persistReorder = useCallback(async (payload: BatchReorderPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 160));
    return payload;
  }, []);

  const handleFailure = useCallback(
    (previousSections: TaskSection[], errorTitle: string) => {
      setSections(previousSections);
      toast({
        title: errorTitle,
        description: "Please try again.",
        variant: "destructive",
      });
    },
    [toast],
  );

  const commitBoardUpdate = useCallback(
    (
      nextSections: TaskSection[],
      previousSections: TaskSection[],
      errorTitle: string,
    ) => {
      setSections(nextSections);
      const payload = buildReorderPayload(nextSections);
      persistReorder(payload).catch((error) => {
        console.error(error);
        handleFailure(previousSections, errorTitle);
      });
    },
    [handleFailure, persistReorder],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = String(event.active.id);
      const task = findTaskById(taskId, sections);
      setActiveTask(task ? { ...task } : null);
    },
    [sections],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      const sourceSectionId = getSectionId(
        active.data.current as DndData | undefined,
      );
      const targetSectionId = getSectionId(
        over.data?.current as DndData | undefined,
      );

      if (!sourceSectionId || !targetSectionId) return;

      const previousSections = cloneSections(sections);
      const workingSections = cloneSections(sections);

      const sourceSection = workingSections.find(
        (section) => section.id === sourceSectionId,
      );
      const targetSection = workingSections.find(
        (section) => section.id === targetSectionId,
      );

      if (!sourceSection || !targetSection) return;

      const sourceIndex = sourceSection.tasks.findIndex(
        (task) => task.id === activeId,
      );
      if (sourceIndex === -1) return;

      const overData = over.data?.current as DndData | undefined;
      let targetIndex =
        overData?.type === "task"
          ? targetSection.tasks.findIndex((task) => task.id === overId)
          : targetSection.tasks.length;
      if (targetIndex === -1) {
        targetIndex = targetSection.tasks.length;
      }

      let didChange = false;

      if (sourceSection === targetSection) {
        if (sourceIndex === targetIndex) return;
        sourceSection.tasks = arrayMove(
          sourceSection.tasks,
          sourceIndex,
          targetIndex,
        ).map((task, index) => ({ ...task, order: index }));
        didChange = true;
      } else {
        const [movingTask] = sourceSection.tasks.splice(sourceIndex, 1);
        if (!movingTask) return;
        movingTask.status = targetSection.id;
        targetSection.tasks.splice(targetIndex, 0, movingTask);

        sourceSection.tasks = sourceSection.tasks.map((task, index) => ({
          ...task,
          order: index,
        }));

        targetSection.tasks = targetSection.tasks.map((task, index) => ({
          ...task,
          order: index,
        }));
        didChange = true;
      }

      if (!didChange) return;

      commitBoardUpdate(
        workingSections,
        previousSections,
        "Unable to reorder tasks",
      );
    },
    [commitBoardUpdate, sections],
  );

  const handleDragCancel = useCallback(() => setActiveTask(null), []);

  return {
    sections,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}

function buildReorderPayload(
  sections: TaskSection[],
): BatchReorderPayload {
  return sections.map((section) => ({
    statusId: section.id,
    tasks: section.tasks.map((task, index) => ({
      id: task.id,
      order: index,
    })),
  }));
}

function cloneSections(sections: TaskSection[]): TaskSection[] {
  return sections.map((section) => ({
    ...section,
    tasks: section.tasks.map((task) => ({ ...task })),
  }));
}

function findTaskById(taskId: string, sections: TaskSection[]): Task | null {
  for (const section of sections) {
    const match = section.tasks.find((task) => task.id === taskId);
    if (match) {
      return match;
    }
  }
  return null;
}

function getSectionId(data: DndData | undefined | null) {
  if (!data) return null;
  return data.sectionId ?? null;
}
