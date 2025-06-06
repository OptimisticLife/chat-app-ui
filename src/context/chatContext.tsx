import { createContext } from "react";
export type savedMessageType = {
  id: string;
  userId: string;
  timeStamp: string;
  msg: string;
};

type ChatContextType = {
  activeUser: { id: string; name: string } | null;
  setActiveUser: React.Dispatch<
    React.SetStateAction<{ id: string; name: string } | null>
  >;
  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  sendChatMessage: (toUserid: string, data: string) => void;
  chatData: Record<string, Array<Record<string, string>>>;
  setChatData?: React.Dispatch<
    React.SetStateAction<Record<string, savedMessageType[]>>
  >;
  handleLogout: () => Promise<void>;
  users: Array<{ id: string; name: string }> | null;
  setUsers: React.Dispatch<
    React.SetStateAction<Array<{ id: string; name: string }> | null>
  >;
  notifications: Record<string, { msgCount: number }>;
  // Optional setChatData for updating chat data
};

export const ChatContext = createContext<ChatContextType>({
  activeUser: null,
  setActiveUser: () => {},
  onlineUsers: [],
  setOnlineUsers: () => {},
  sendChatMessage: () => {},
  chatData: {},
  setChatData: () => {},
  handleLogout: async () => {},
  users: [],
  setUsers: () => {},
  notifications: {},
});
