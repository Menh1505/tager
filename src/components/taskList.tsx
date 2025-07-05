"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskItem } from "./taskItem";
import { CreateTaskModal } from "./createTaskModal";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/mock-data/tasks";

export const TaskList = () => {
  const workspaceId = useWorkspaceId();
  const { tasks } = useTasks(workspaceId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">("all");

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
            <TaskItem key={task.id} task={task} />
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

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
