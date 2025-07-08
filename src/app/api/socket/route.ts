import { NextResponse } from "next/server";
import { Server, Socket } from "socket.io";

// Define message type interface
interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: number;
}

// Define incoming message type (before server adds id)
interface IncomingMessage {
  text: string;
  userId: string;
  username: string;
  timestamp: number;
}

// Define custom global namespace for TypeScript
declare global {
  var io: Server | undefined;
}

// Biến toàn cục để lưu trữ messages
const messages: ChatMessage[] = [];

// Handler cho GET request
export async function GET() {
  // Trả về thông báo thành công đơn giản
  return NextResponse.json({ success: true });
}

// Hàm khởi tạo socket - sẽ được gọi từ phía client
export async function POST() {
  if (!global.io) {
    console.log("Khởi tạo Socket.IO server");
    const socketServer = new Server({
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Lắng nghe kết nối từ client
    socketServer.on("connection", (socket: Socket) => {
      console.log("Client kết nối:", socket.id);

      // Gửi lịch sử chat cho client mới
      socket.emit("chat-messages", messages);

      // Xử lý khi có tin nhắn mới
      socket.on("send-message", (message: IncomingMessage) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };

        // Lưu tin nhắn vào mảng
        messages.push(newMessage);

        // Giới hạn số lượng tin nhắn
        if (messages.length > 100) messages.shift();

        // Phát tin nhắn đến tất cả clients
        socketServer.emit("new-message", newMessage);
      });

      // Xử lý khi client ngắt kết nối
      socket.on("disconnect", () => {
        console.log("Client ngắt kết nối:", socket.id);
      });
    });

    // Lưu IO instance vào global để tái sử dụng
    global.io = socketServer;

    // Bắt đầu lắng nghe ở port 3001
    socketServer.listen(3001);
    console.log("Socket.IO đang lắng nghe ở port 3001");
  }

  return NextResponse.json({ success: true });
}
