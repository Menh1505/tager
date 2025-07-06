import { v4 as uuidv4 } from "uuid";

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

// Mock data cho tasks
export const tasks: Task[] = [
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
];

// Mock data cho users (để hiển thị)
export const users = [
  { id: "user-1", name: "Nguyễn Văn A", email: "a@example.com", role: "ADMIN" },
  { id: "user-2", name: "Trần Thị B", email: "b@example.com", role: "MEMBER" },
  { id: "user-3", name: "Lê Văn C", email: "c@example.com", role: "MEMBER" },
];
