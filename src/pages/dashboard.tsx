import DashboardNav from "../components/dashboardNav";
import UserList from "../components/userList";
import Chats from "../components/chats";
import { ChatProvider } from "../context/chatProvider";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <DashboardNav />
      <div className="dashboard-content">
        <ChatProvider>
          <div className="user-content">
            <UserList />
          </div>
          <div className="chat-content">
            <Chats />
          </div>
        </ChatProvider>
      </div>
    </div>
  );
}
