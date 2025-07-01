"use client";

import { useState, useRef, useEffect } from "react";
import { SiGooglemessages } from "react-icons/si";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useSocketChat } from "@/hooks/use-socket-chat";
import { useCurrent } from "@/features/auth/api/use-current";

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = () => {
  const { data: user } = useCurrent();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage } = useSocketChat();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (inputMessage.trim() && user) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  return isOpen ? (
    <div className="fixed bottom-10 right-10 h-[80%] w-[40%] shadow-lg rounded-lg overflow-hidden">
      <div className="h-full flex justify-center items-center">
        <div className="flex flex-col h-full w-full bg-white border border-gray-200">
          <div className="flex justify-between items-center bg-blue-600 text-white p-3">
            <div className="font-semibold">Chat</div>
            <IoCloseCircleOutline className="size-6 cursor-pointer hover:opacity-80" onClick={toggleChat} />
          </div>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-3 flex ${msg.userId === user.$id ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[70%] px-3 py-2 rounded-lg ${
                      msg.userId === user.$id 
                        ? 'bg-blue-500 text-white rounded-tr-none' 
                        : 'bg-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {msg.userId !== user.$id && (
                      <div className="text-xs font-semibold mb-1">{msg.userName}</div>
                    )}
                    <div>{msg.content}</div>
                    <div className={`text-xs mt-1 ${msg.userId === user.$id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-white border-t">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nhập tin nhắn..." 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                  onClick={handleSend}
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="fixed bottom-10 right-10 cursor-pointer">
      <div className="bg-blue-500 p-3 rounded-full text-white shadow-lg hover:bg-blue-600 transition">
        <SiGooglemessages onClick={toggleChat} className="size-6" />
      </div>
      {messages.length > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {messages.filter(m => m.userId !== user.$id).length}
        </div>
      )}
    </div>
  );
};

export default Chat;