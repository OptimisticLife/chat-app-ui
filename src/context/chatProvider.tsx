import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatContext } from "./chatContext";
import { AuthContext } from "./authContext";
import { updateChatDataToServer, fetchChatDataFromServer } from "../utlity";
import NotificationSound from "./../assets/notification_sound.mp3";

const apiUrl = import.meta.env.VITE_API_URL;

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
  const [users, setUsers] = useState<Array<{
    id: string;
    name: string;
  }> | null>(null);

  const [notifications, setNotifications] = useState<
    Record<string, { msgCount: number }>
  >({});

  const { loggedUser } = useContext(AuthContext);

  const activeUserRef = useRef(activeUser);

  const chatDataRef = useRef(chatData);

  useEffect(() => {
    chatDataRef.current = chatData;
  }, [chatData]);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    if (
      activeUserRef.current?.id &&
      activeUserRef.current?.id !== undefined &&
      activeUserRef.current &&
      notifications[activeUserRef.current.id]?.msgCount > 0
    ) {
      setNotifications((prevNotifications) => ({
        ...prevNotifications,
        ...(activeUserRef.current?.id
          ? { [activeUserRef.current.id]: { msgCount: 0 } }
          : {}),
      }));
    }
  }, [activeUser, notifications]);

  // Fetch chat data when loggedUser is available
  useEffect(() => {
    if (!loggedUser?.id) return;

    let isMounted = true;

    fetchChatDataFromServer(loggedUser.id).then((data) => {
      if (isMounted && data) {
        console.log("Chat data loaded in provider:", data);
        setChatData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loggedUser?.id]);

  // WebSocket connection
  useEffect(() => {
    if (!loggedUser?.id) return;

    socket = new WebSocket(`${apiUrl}?userId=${loggedUser.id}`);

    socket.onopen = () => {
      console.log("🔗 WebSocket connected");
    };

    socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data) as websocketMessageType;

      if (messageData.type === "presenceStatus") {
        setOnlineUsers(messageData.userPresence?.users || []);
      }

      if (messageData.type === "chat" && messageData.chatMessage) {
        const notificationSound = new Audio(NotificationSound);
        notificationSound.volume = 0.8;

        const chatMessage = messageData.chatMessage;
        if (chatMessage.fromUserId) {
          updateChatState(
            chatMessage.fromUserId,
            chatMessage.data,
            chatMessage.fromUserId
          );
        }

        console.log("details, ", chatMessage, activeUser);

        // Update notifications based on active users on chat..
        if (
          chatMessage.fromUserId !== undefined &&
          chatMessage.fromUserId !== activeUserRef.current?.id
        ) {
          console.log("actually am reaching here...");
          notificationSound.play().catch((err) => {
            console.error("Audio play error:", err);
          });
          setNotifications((prev) => {
            return {
              ...prev,
              [chatMessage.fromUserId as string]: {
                msgCount: prev.details?.msgCount
                  ? prev.details.msgCount + 1
                  : 1,
              },
            };
          });
        }
      }
    };

    return () => {
      socket?.close();
      socket = null;
    };
  }, [loggedUser?.id]);

  useEffect(() => {
    console.log("notifications after update", notifications);
  }, [notifications]);

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
        console.log("Chat data saved on logout.");
      } catch (err) {
        console.error(" Failed to save chat data on logout:", err);
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
        users,
        setUsers,
        notifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
