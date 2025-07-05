import { useCallback, useState } from "react";
import { tasks as mockTasks, Task } from "@/mock-data/tasks";
import { v4 as uuidv4 } from "uuid";

export const useTasks = (workspaceId: string) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks.filter((task) => task.workspaceId === workspaceId));

  // Lấy task theo ID
  const getTaskById = useCallback(
    (taskId: string) => {
      return tasks.find((task) => task.id === taskId);
    },
    [tasks]
  );

  // Thêm task mới
  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  // Cập nhật task
  const updateTask = useCallback((taskId: string, updates: Partial<Omit<Task, "id" | "createdAt" | "createdBy">>) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task)));
  }, []);

  // Xóa task
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  // Thêm member vào task
  const addMemberToTask = useCallback((taskId: string, userId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && !task.assignees.includes(userId)) {
          return {
            ...task,
            assignees: [...task.assignees, userId],
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );
  }, []);

  // Xóa member khỏi task
  const removeMemberFromTask = useCallback((taskId: string, userId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            assignees: task.assignees.filter((id) => id !== userId),
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );
  }, []);

  return {
    tasks,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    addMemberToTask,
    removeMemberFromTask,
  };
};
