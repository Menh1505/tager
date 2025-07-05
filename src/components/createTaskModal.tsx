"use client";

import { useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "../hooks/use-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal = ({ isOpen, onClose }: CreateTaskModalProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { addTask } = useTasks(workspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "completed">("todo");

  const handleCreateTask = () => {
    if (!title.trim() || !currentUser) return;

    addTask({
      workspaceId,
      title,
      description,
      status,
      assignees: [], // Start with no assignees
      createdBy: currentUser.$id,
    });

    // Reset form và đóng modal
    setTitle("");
    setDescription("");
    setStatus("todo");
    onClose();
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Tạo Task mới</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input id="title" placeholder="Nhập tiêu đề task" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" placeholder="Mô tả chi tiết về task" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as "todo" | "in-progress" | "completed")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Cần làm</SelectItem>
                <SelectItem value="in-progress">Đang làm</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleCreateTask} disabled={!title.trim()}>
              Tạo Task
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
};
