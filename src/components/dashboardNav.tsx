import { useContext } from "react";
import { useAuth } from "../hooks/auth";
import { ChatContext } from "../context/chatContext";

type requestOptionsType = {
  method: string;
  credentials: RequestCredentials;
  headers: {
    "Content-Type": string;
    "X-user-id": string;
  };
  body?: string;
};

const apiUrl = import.meta.env.VITE_API_URL;

function DashboardNav() {
  const { refreshAuthStatus, setLoggedUser, loggedUser } = useAuth();
  const { handleLogout } = useContext(ChatContext);
  // Assuming setChatData is available in the context
  // If setChatData is not available, you can remove this line and the related logic
  const logoutHandler = async () => {
    const requestOptions: requestOptionsType = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-user-id": loggedUser?.id || "", // Ensure we send the user ID if available
      },
    };

    try {
      await handleLogout();
      const response = await fetch(`${apiUrl}/logout`, requestOptions);

      if (!response.ok && response.status !== 401) {
        console.error("Logout failed");
        return;
      }

      // Proceed with cleanup
      setLoggedUser(null); // Clear user info
      await refreshAuthStatus(); // Re-check session (will set isAuthenticated to false)// Redirect user
    } catch (error) {
      console.error("Error during logout:", error);
      // Optionally fallback to cleanup even if logout fails
      setLoggedUser(null);
      await refreshAuthStatus();
    }
  };

  return (
    <div className="dashboard-nav">
      <p className="app-title">Chat-4647</p>
      <div className="user-info">
        <p className="logged-user">{loggedUser?.name || "John Doe"}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20px"
          viewBox="0 -960 960 960"
          width="20px"
          fill="#757dd4"
          onClick={logoutHandler}
        >
          <path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840v80q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200v80Zm160-160-56-57 103-103H360v-80h327L584-624l56-56 200 200-200 200Z" />
        </svg>
      </div>
    </div>
  );
}

export default DashboardNav;
