import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useCurrent } from "@/features/auth/api/use-current";

let socket: Socket | null = null;

interface UseSocketChatProps {
  workspaceId: string; // Nhận workspaceId từ component cha
}

export const useSocketChat = ({ workspaceId }: UseSocketChatProps) => {
  const { data: user } = useCurrent();
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Khởi tạo Socket.IO server thông qua API route
    fetch("/api/socket", {
      method: "POST",
    }).then(() => {
      // Tạo kết nối socket và tham gia vào room theo workspaceId
      if (!socket) {
        socket = io("http://localhost:3001");

        socket.on("connect", () => {
          console.log("Socket kết nối thành công!");
          // Tham gia vào room tương ứng với workspaceId
          socket?.emit("joinRoom", workspaceId);
        });
      }

      // Nhận tin nhắn cũ
      socket.on("chat-messages", (history) => {
        setMessages(history);
      });

      // Nhận tin nhắn mới
      socket.on("new-message", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    });

    // Hủy lắng nghe sự kiện khi component unmount
    return () => {
      if (socket) {
        socket.off("chat-messages");
        socket.off("new-message");
        socket.emit("leaveRoom", workspaceId); // Khi component unmount, rời khỏi room
      }
    };
  }, [workspaceId]); // Khi workspaceId thay đổi, tham gia lại vào room mới

  // Hàm gửi tin nhắn
  const sendMessage = (content: string) => {
    if (!socket || !user) return;

    socket.emit("send-message", {
      userId: user.$id,
      userName: user.name,
      content,
      workspaceId,
      timestamp: Date.now(),
    });
  };

  return { messages, sendMessage };
};
