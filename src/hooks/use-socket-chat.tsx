"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useCurrent } from "@/features/auth/api/use-current";

let socket: Socket | null = null;

export const useSocketChat = () => {
  const { data: user } = useCurrent();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Khởi tạo Socket.IO server thông qua API route
    fetch("/api/socket", {
      method: "POST",
    }).then(() => {
      // Tạo kết nối socket
      if (!socket) {
        socket = io("http://localhost:3001");
        
        socket.on("connect", () => {
          console.log("Socket kết nối thành công!");
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

    return () => {
      // Hủy lắng nghe sự kiện khi component unmount
      if (socket) {
        socket.off("chat-messages");
        socket.off("new-message");
      }
    };
  }, []);

  // Hàm gửi tin nhắn
  const sendMessage = (content: string) => {
    if (!socket || !user) return;
    
    socket.emit("send-message", {
      userId: user.$id,
      userName: user.name,
      content,
      timestamp: Date.now(),
    });
  };

  return { messages, sendMessage };
};