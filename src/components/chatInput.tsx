import { useState } from "react";

type ChatInputProps = {
  onSend: (msg: string) => void;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [typedMsg, setTypedMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedMsg.trim() !== "") {
      onSend(typedMsg);
      setTypedMsg("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (typedMsg.trim() !== "") {
        onSend(typedMsg);
        setTypedMsg("");
      }
    }
  };

  return (
    <form className="active-user-chat-input" onSubmit={handleSubmit}>
      <textarea
        placeholder="Type a message..."
        className="chat-input"
        onChange={(e) => setTypedMsg(e.target.value)}
        value={typedMsg}
        autoFocus
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button type="submit" className="shallow-send-btn" disabled={disabled}>
        <span className="material-symbols-outlined chat-send-btn">send</span>
      </button>
    </form>
  );
}
