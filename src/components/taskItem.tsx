"use client";

import { useState } from "react";
import { Task, users } from "@/components/taskList";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskDetailModal } from "./taskDetailModal";
import { useConfirm } from "@/hooks/use-confirm";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void;
  onAddMember: (taskId: string, userId: string) => void;
  onRemoveMember: (taskId: string, userId: string) => void;
}

export const TaskItem = ({ task, onDelete, onUpdate, onAddMember, onRemoveMember }: TaskItemProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm("Xóa task", `Bạn có chắc chắn muốn xóa task "${task.title}"?`, "destructive");

  // Tìm thông tin assignees
  const assignees = users.filter((user) => task.assignees.includes(user.id));

  // Định dạng ngày tháng
  const formattedDate = format(new Date(task.updatedAt), "dd/MM/yyyy");

  // Xử lý xóa task
  const handleDelete = async () => {
    const ok = await confirm();
    if (ok) {
      onDelete(task.id);
    }
  };

  const statusColors = {
    todo: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const statusText = {
    todo: "Cần làm",
    "in-progress": "Đang làm",
    completed: "Hoàn thành",
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsDetailOpen(true)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailOpen(true);
                  }}>
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge className={`mt-1 ${statusColors[task.status]}`}>{statusText[task.status]}</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </div>
          <div className="flex -space-x-2">
            {assignees.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {assignees.length > 3 && (
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback>+{assignees.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardFooter>
      </Card>

      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={task}
        onUpdate={onUpdate}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
      />

      <ConfirmDialog />
    </>
  );
};
