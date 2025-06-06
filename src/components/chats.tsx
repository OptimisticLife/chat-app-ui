import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/chatContext";
import type { savedMessageType } from "../context/chatProvider";
import { fetchChatDataFromServer } from "../utlity";
import { AuthContext } from "../context/authContext";
import ChatInput from "./chatInput";

const memoizedUser: Record<string, string> = {};

export default function Chats() {
  const { loggedUser } = useContext(AuthContext);
  const {
    activeUser,
    setActiveUser,
    onlineUsers,
    sendChatMessage,
    chatData,
    setChatData,
    users,
  } = useContext(ChatContext);

  function fetchUserName(userId: string): string | null {
    if (memoizedUser[userId]) return memoizedUser[userId];
    const user = users?.find((user) => user.id === userId);
    if (user) {
      memoizedUser[userId] = user.name;
      return user.name;
    }
    return null;
  }

  useEffect(() => {
    fetchChatDataFromServer(loggedUser?.id || "").then((data) => {
      if (data && setChatData) {
        setChatData({ ...data });
      }
    });
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeUser) {
      console.log(`Active user: ${activeUser.name}`);
    } else {
      console.log("No active user selected");
    }
  }, [activeUser]);

  useEffect(() => {
    const activeUserId = activeUser?.id;
    if (chatContainerRef.current && activeUserId && chatData[activeUserId]) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeUser?.id, chatData]);

  function renderMessages(msgData: savedMessageType) {
    const { id, userId, timeStamp, msg } = msgData;
    const isLoggedUser = userId === loggedUser?.id;
    const senderName =
      fetchUserName(userId) ?? (userId === activeUser?.id ? "sender" : "You");

    const formattedTime = new Date(timeStamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        className={`chat-message ${isLoggedUser ? "msg-right-aligned" : ""}`}
        key={id}
      >
        <div className="chat-message-header">
          <span className="message-sender">{senderName}</span>
          <span>|</span>
          <span className="message-time">{formattedTime}</span>
        </div>

        <div
          className={`chat-message-content ${
            isLoggedUser ? "logged-user-msg" : ""
          }`}
        >
          <p className="message-text">{msg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {activeUser ? (
        <>
          <div className="active-user-details">
            <div className="user-profile">
              {onlineUsers.includes(activeUser.id) ? (
                <span className="material-symbols-outlined online-status">
                  person
                </span>
              ) : (
                <span className="material-symbols-outlined">person</span>
              )}
              <p className="username">{activeUser.name}</p>
            </div>
            <span
              className="material-symbols-outlined"
              onClick={() => setActiveUser(null)}
              style={{ cursor: "pointer" }}
            >
              close
            </span>
          </div>

          <div className="active-user-chats" ref={chatContainerRef}>
            {chatData[activeUser.id]?.length > 0 ? (
              chatData[activeUser.id].map((messageData) =>
                renderMessages(messageData as savedMessageType)
              )
            ) : (
              <p className="info">No messages yet.</p>
            )}
          </div>

          {onlineUsers.includes(activeUser.id) ? (
            <ChatInput onSend={(msg) => sendChatMessage(activeUser.id, msg)} />
          ) : (
            <p className="offline-restriction info">
              You can send messages only to online users.
            </p>
          )}
        </>
      ) : (
        <div className="no-active-user">
          <p className="info">Your connection to the server is established.</p>
          <p className="info">Start a chat with any active user.</p>
        </div>
      )}
    </div>
  );
}
