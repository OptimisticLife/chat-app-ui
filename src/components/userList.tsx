import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/chatContext";
import { AuthContext } from "../context/authContext";

type requestOptionsType = {
  method: string;
  credentials: RequestCredentials;
  headers: {
    "Content-Type": string;
  };
  body?: string;
};

type UsersType = {
  id: string;
  name: string;
  email: string;
};
const apiUrl = import.meta.env.VITE_API_URL;

async function fetchUsers(): Promise<Array<UsersType> | string> {
  const requestOptions: requestOptionsType = {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(`${apiUrl}/get-users`, requestOptions);
    const responseJson = await response.json();
    const users = responseJson.data as Array<UsersType>;
    if (response.ok) {
      console.log("Successfully fetched users");
      return users;
    } else {
      console.error("Failed to fetch users");
      return Promise.reject("Failed to fetch users");
    }
  } catch (error) {
    console.error("Error during fetching users:", error);
    return Promise.reject("Error fetching users");
  }
}
function UserList() {
  // const [users, setUsers] = useState<Array<UsersType>>([]);
  const [status, setStatus] = useState<string | null>(null);
  const { setActiveUser, onlineUsers, users, setUsers, notifications } =
    useContext(ChatContext);
  const { loggedUser } = useContext(AuthContext);

  useEffect(() => {
    console.log("incoming notifications", notifications);
    try {
      fetchUsers().then((data: string | Array<UsersType>) => {
        console.log("Fetched users:", data);
        if (typeof data === "string") {
          throw new Error("Error fetching users: " + data);
        } else if (data.length > 0) {
          setUsers(data);
        } else {
          setStatus("No users found");
        }
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setStatus("Error fetching users");
    }
  }, [notifications, setUsers]);
  return (
    <div className="user-list-container">
      {/* <p className="info side-headings">Private and Group Chats</p> */}

      {users && users.length > 0 ? (
        <>
          <ul className="user-list">
            {users.map((user) => (
              <li
                key={user.id}
                className="user-item"
                onClick={() => setActiveUser({ id: user.id, name: user.name })}
              >
                {onlineUsers.includes(user.id) ? (
                  <span className="material-symbols-outlined online-status">
                    person
                  </span>
                ) : (
                  <span className="material-symbols-outlined">person</span>
                )}
                <p className="user-name">
                  {user.name}
                  {loggedUser && loggedUser.id === user.id && "(You)"}
                  {notifications[user.id] &&
                    notifications[user.id].msgCount > 0 && (
                      <span className="material-symbols-outlined notification">
                        notifications
                      </span>
                    )}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <span className="status-message">{status || "Loading users..."}</span>
      )}
    </div>
  );
}

export default UserList;
