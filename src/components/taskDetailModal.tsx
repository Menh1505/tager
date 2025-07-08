"use client";

import { useEffect, useRef, useState } from "react";
import { Task, users } from "@/components/taskList";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, PlusCircle, Calendar, User } from "lucide-react";
import { toast } from "sonner";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void;
  onAddMember: (taskId: string, userId: string) => void;
  onRemoveMember: (taskId: string, userId: string) => void;
}

export const TaskDetailModal = ({ isOpen, onClose, task, onUpdate, onAddMember, onRemoveMember }: TaskDetailModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  // Reset form values when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  }, [task]);

  // Lọc users đã được gán và chưa được gán
  const assignedUsers = users.filter((user) => task.assignees.includes(user.id));
  const unassignedUsers = users.filter((user) => !task.assignees.includes(user.id));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileExists, setFileExists] = useState(false);

  // Kiểm tra xem file đã tồn tại chưa
  useEffect(() => {
    fetch(`/api/upload?taskId=${task.id}`, { method: "HEAD" }).then((res) => {
      setFileExists(res.status === 200);
    });
  }, [task.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", task.id);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("Tải file lên thành công");
      setFileExists(true);
    } else {
      toast.error("Lỗi khi tải file");
    }
  };

  const handleDownload = () => {
    window.open(`/api/upload?taskId=${task.id}`, "_blank");
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/upload?taskId=${task.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Xóa file thành công");
      setFileExists(false);
    } else {
      toast.error("Xóa file thất bại");
    }
  };

  // Xử lý cập nhật task
  const handleUpdate = () => {
    onUpdate(task.id, {
      title,
      description,
      status,
    });
    onClose();
  };

  const formattedCreatedAt = format(new Date(task.createdAt), "dd/MM/yyyy HH:mm");
  const formattedUpdatedAt = format(new Date(task.updatedAt), "dd/MM/yyyy HH:mm");

  // Tìm thông tin người tạo
  const creator = users.find((user) => user.id === task.createdBy);

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Chi tiết Task</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
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

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ngày tạo: {formattedCreatedAt}</p>
                <p className="text-xs text-muted-foreground">Cập nhật: {formattedUpdatedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Người tạo</p>
                {creator && (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{creator.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Người được gán ({assignedUsers.length})</p>
              <div className="space-y-2">
                {assignedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => onRemoveMember(task.id, user.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {unassignedUsers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Thêm người</p>
                  <div className="space-y-2">
                    {unassignedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onAddMember(task.id, user.id)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Tệp đính kèm</Label>
            {!fileExists && (
              <>
                <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Tải file lên
                </Button>
              </>
            )}

            {fileExists && (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleDownload}>
                  Tải xuống file
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Xóa file
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
};
