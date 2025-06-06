import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatContext } from "./chatContext";
import { AuthContext } from "./authContext";
import { updateChatDataToServer, fetchChatDataFromServer } from "../utlity";

type UserPresenceType = {
  users: string[];
};

type ChatMessageType = {
  toUserId?: string;
  data: string;
  fromUserId?: string;
};

type websocketMessageType = {
  type: "chat" | "presenceStatus";
  chatMessage?: ChatMessageType;
  userPresence?: UserPresenceType;
  timestamp?: string;
};

export type savedMessageType = {
  id: string;
  userId: string;
  timeStamp: string;
  msg: string;
};

let socket: WebSocket | null = null;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [chatData, setChatData] = useState<Record<string, savedMessageType[]>>(
    {}
  );

  const { loggedUser } = useContext(AuthContext);

  const chatDataRef = useRef(chatData);
  useEffect(() => {
    chatDataRef.current = chatData;
  }, [chatData]);

  // ✅ Fetch chat data when loggedUser is available
  useEffect(() => {
    if (!loggedUser?.id) return;

    let isMounted = true;

    fetchChatDataFromServer(loggedUser.id).then((data) => {
      if (isMounted && data) {
        console.log("✅ Chat data loaded in provider:", data);
        setChatData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loggedUser?.id]);

  // ✅ WebSocket connection
  useEffect(() => {
    if (!loggedUser?.id) return;

    socket = new WebSocket(`ws://localhost:3333?userId=${loggedUser.id}`);

    socket.onopen = () => {
      console.log("🔗 WebSocket connected");
    };

    socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data) as websocketMessageType;

      if (messageData.type === "presenceStatus") {
        setOnlineUsers(messageData.userPresence?.users || []);
      }

      if (messageData.type === "chat" && messageData.chatMessage) {
        const chatMessage = messageData.chatMessage;
        if (chatMessage.fromUserId) {
          updateChatState(
            chatMessage.fromUserId,
            chatMessage.data,
            chatMessage.fromUserId
          );
        }
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      socket?.close();
      socket = null;
    };
  }, [loggedUser?.id]);

  // ✅ Save chat data on unmount/logout
  useEffect(() => {
    return () => {
      if (loggedUser?.id && Object.keys(chatDataRef.current).length > 0) {
        const chatDataString = JSON.stringify(chatDataRef.current);
        updateChatDataToServer(chatDataString, loggedUser.id);
      }
    };
  }, [loggedUser]);

  function updateChatState(chatDataKey: string, msg: string, senderId: string) {
    const newMessage: savedMessageType = {
      id: uuidv4(),
      userId: senderId,
      msg,
      timeStamp: new Date().toISOString(),
    };

    setChatData((prev) => {
      const existing = prev[chatDataKey] || [];
      return {
        ...prev,
        [chatDataKey]: [...existing, newMessage],
      };
    });
  }

  function sendChatMessage(toUserId: string, data: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const chatMessage: ChatMessageType = { toUserId, data };
    const message: websocketMessageType = {
      type: "chat",
      chatMessage,
      timestamp: new Date().toISOString(),
    };

    updateChatState(toUserId, data, loggedUser?.id || "");
    socket.send(JSON.stringify(message));
  }

  async function handleLogout() {
    if (loggedUser?.id && Object.keys(chatDataRef.current).length > 0) {
      try {
        const chatDataString = JSON.stringify(chatDataRef.current);
        await updateChatDataToServer(chatDataString, loggedUser.id);
        console.log("✅ Chat data saved on logout.");
      } catch (err) {
        console.error("❌ Failed to save chat data on logout:", err);
      }
    }
    // Proceed with actual logout flow...
  }

  return (
    <ChatContext.Provider
      value={{
        activeUser,
        setActiveUser,
        onlineUsers,
        setOnlineUsers,
        chatData,
        setChatData,
        sendChatMessage,
        handleLogout,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
