"use client";

import { useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskItem } from "./taskItem";
import { CreateTaskModal } from "./createTaskModal";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  assignees: string[]; // Array of user IDs
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data cho users (để hiển thị)
export const users = [
  { id: "user-1", name: "Nguyễn Văn A", email: "a@example.com", role: "ADMIN" },
  { id: "user-2", name: "Trần Thị B", email: "b@example.com", role: "MEMBER" },
  { id: "user-3", name: "Lê Văn C", email: "c@example.com", role: "MEMBER" },
];

export const TaskList = () => {
  const workspaceId = useWorkspaceId();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">("all");

  // State to hold tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: uuidv4(),
      workspaceId: "686a30cb001c67070a32",
      title: "Thiết kế UI dashboard",
      description: "Tạo mockup và thiết kế UI cho trang dashboard",
      status: "completed",
      assignees: ["user-1", "user-2"],
      createdBy: "user-1",
      createdAt: new Date(2023, 5, 15).toISOString(),
      updatedAt: new Date(2023, 5, 20).toISOString(),
    },
    {
      id: uuidv4(),
      workspaceId: "686a30cb001c67070a32",
      title: "Phát triển tính năng authentication",
      description: "Xây dựng API và UI cho đăng nhập/đăng ký",
      status: "in-progress",
      assignees: ["user-3"],
      createdBy: "user-1",
      createdAt: new Date(2023, 6, 1).toISOString(),
      updatedAt: new Date(2023, 6, 5).toISOString(),
    },
    {
      id: uuidv4(),
      workspaceId: "686a30cb001c67070a32",
      title: "Viết tài liệu API",
      description: "Tạo tài liệu cho API endpoints",
      status: "todo",
      assignees: ["user-2"],
      createdBy: "user-2",
      createdAt: new Date(2023, 6, 10).toISOString(),
      updatedAt: new Date(2023, 6, 10).toISOString(),
    },
  ]);

  // CRUD Operations
  const addTask = (newTaskData: {
    workspaceId: string;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "completed";
    assignees: string[];
    createdBy: string;
  }) => {
    const newTask: Task = {
      id: uuidv4(),
      ...newTaskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    toast.success("Task đã được tạo thành công");
  };

  const updateTask = (taskId: string, updatedData: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updatedData,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
    toast.success("Task đã được cập nhật");
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task đã được xóa");
  };

  const addMemberToTask = (taskId: string, userId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignees: [...task.assignees, userId],
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
    toast.success("Đã thêm thành viên vào task");
  };

  const removeMemberFromTask = (taskId: string, userId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignees: task.assignees.filter((id) => id !== userId),
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
    toast.success("Đã xóa thành viên khỏi task");
  };

  console.log("Current workspaceId:", workspaceId);
  console.log("Tasks loaded:", tasks.length);

  // Lọc tasks theo search và status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Danh sách Tasks</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Tạo Task mới
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm task..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex space-x-2">
          <Badge variant={statusFilter === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("all")}>
            Tất cả
          </Badge>
          <Badge variant={statusFilter === "todo" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("todo")}>
            Cần làm
          </Badge>
          <Badge variant={statusFilter === "in-progress" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("in-progress")}>
            Đang làm
          </Badge>
          <Badge variant={statusFilter === "completed" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("completed")}>
            Hoàn thành
          </Badge>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={deleteTask}
              onUpdate={updateTask}
              onAddMember={addMemberToTask}
              onRemoveMember={removeMemberFromTask}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground mb-4">Không có task nào</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>Tạo task mới</Button>
          </CardContent>
        </Card>
      )}

      <CreateTaskModal workspaceId={workspaceId} isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onAddTask={addTask} />
    </div>
  );
};
