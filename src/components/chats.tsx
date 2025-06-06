import { useContext, useEffect, useState, useRef } from "react";
import { ChatContext } from "../context/chatContext";
import type { savedMessageType } from "../context/chatProvider";
import { fetchChatDataFromServer } from "../utlity";
import { AuthContext } from "../context/authContext";

export default function Chats() {
  const [typedMsg, setTypedMsg] = useState<string>("");
  const { loggedUser } = useContext(AuthContext);
  const {
    activeUser,
    setActiveUser,
    onlineUsers,
    sendChatMessage,
    chatData,
    setChatData,
  } = useContext(ChatContext);

  useEffect(() => {
    console.log("Fetching chat data from server starts....");
    fetchChatDataFromServer(loggedUser?.id || "").then((data) => {
      if (data) {
        console.log("Chat data fetched successfully:", data);
        if (setChatData) {
          setChatData({ ...data });
        } else {
          console.log("setter is not availablex..");
        }
      } else {
        console.log("No chat data found for the user.");
      }
    });
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Log active user change
  useEffect(() => {
    if (activeUser) {
      console.log(`Active user: ${activeUser.name}`);
    } else {
      console.log("No active user selected");
    }
  }, [activeUser]);

  // ✅ Scroll to bottom after chat messages render
  useEffect(() => {
    const activeUserId = activeUser?.id;
    if (chatContainerRef.current && activeUserId && chatData[activeUserId]) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeUser?.id, chatData]);

  // Render single message
  function renderMessages(msgData: savedMessageType) {
    const { id, userId, timeStamp, msg } = msgData;
    const senderName = userId === activeUser?.id ? "sender" : "You";
    const formattedTime = new Date(timeStamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        className={`chat-message ${
          senderName === "You" ? "msg-right-aligned" : ""
        }`}
        key={id}
      >
        <div
          className={`chat-message-content ${
            senderName === "You" ? "logged-user-msg" : ""
          }  `}
        >
          <p className="message-text">{msg}</p>
          <span className="message-time">{formattedTime}</span>
        </div>
      </div>
    );
  }

  function handleChatSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (typedMsg.trim() !== "" && activeUser) {
      sendChatMessage(activeUser.id, typedMsg);
      setTypedMsg("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      if (typedMsg.trim() !== "" && activeUser) {
        sendChatMessage(activeUser.id, typedMsg);
        setTypedMsg("");
      }
    }
  }

  function inputTypeMsgHandler(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setTypedMsg(event.target.value);
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
            <form
              className="active-user-chat-input"
              onSubmit={handleChatSubmit}
            >
              <textarea
                placeholder="Type a message..."
                className="chat-input"
                onChange={inputTypeMsgHandler}
                value={typedMsg}
                autoFocus
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className="shallow-send-btn">
                <span className="material-symbols-outlined chat-send-btn">
                  send
                </span>
              </button>
            </form>
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
