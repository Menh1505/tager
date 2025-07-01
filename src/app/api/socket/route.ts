import { NextResponse } from "next/server";
import { Server } from "socket.io";

// Biến toàn cục để lưu trữ messages và io
let io: any;
const messages: any[] = [];

// Handler cho GET request
export async function GET() {
  // Trả về thông báo thành công đơn giản
  return NextResponse.json({ success: true });
}

// Hàm khởi tạo socket - sẽ được gọi từ phía client
export async function POST() {
  if (!io) {
    // Bạn có thể sử dụng biến toàn cục để truy cập global.io trong runtime của server
    if (!(global as any).io) {
      console.log("Khởi tạo Socket.IO server");
      const io = new Server({
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });

      // Lắng nghe kết nối từ client
      io.on("connection", (socket) => {
        console.log("Client kết nối:", socket.id);
        
        // Gửi lịch sử chat cho client mới
        socket.emit("chat-messages", messages);
        
        // Xử lý khi có tin nhắn mới
        socket.on("send-message", (message) => {
          const newMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          };
          
          // Lưu tin nhắn vào mảng
          messages.push(newMessage);
          
          // Giới hạn số lượng tin nhắn
          if (messages.length > 100) messages.shift();
          
          // Phát tin nhắn đến tất cả clients
          io.emit("new-message", newMessage);
        });
        
        // Xử lý khi client ngắt kết nối
        socket.on("disconnect", () => {
          console.log("Client ngắt kết nối:", socket.id);
        });
      });

      // Lưu IO instance vào global để tái sử dụng
      (global as any).io = io;
    }
    
    // Gán biến toàn cục
    io = (global as any).io;
    
    // Bắt đầu lắng nghe ở port 3001
    io.listen(3001);
    console.log("Socket.IO đang lắng nghe ở port 3001");
  }
  
  return NextResponse.json({ success: true });
}