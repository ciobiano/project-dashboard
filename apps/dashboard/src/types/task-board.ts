export type Direction = "up" | "down";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Normal";
  assignees: string[];
  status: string;
  order: number;
}

export interface TaskSection {
  id: string;
  title: string;
  accent: string;
  tasks: Task[];
}

export type BatchReorderPayload = Array<{
  statusId: string;
  tasks: Array<{ id: string; order: number }>;
}>;

export type DndContainerData = {
  type: "container";
  sectionId: string;
  empty?: boolean;
};

export type DndTaskData = {
  type: "task";
  sectionId: string;
  task: Task;
};

export type DndData = DndContainerData | DndTaskData;
