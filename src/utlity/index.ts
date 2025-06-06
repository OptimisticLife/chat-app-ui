type requestOptionsType = {
  method: string;
  credentials: RequestCredentials;
  headers: {
    "Content-Type": string;
    "x-user-id"?: string; // Optional user ID header for update requests
  };
  body?: string;
};

const apiUrl = import.meta.env.VITE_API_URL;

export async function updateChatDataToServer(
  chatData: string,
  loggedUserId: string
) {
  const requestOptions: requestOptionsType = {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": loggedUserId, // Include user ID in headers
    },
    body: chatData,
  };

  console.log("Before updating chat data to server...", JSON.parse(chatData));

  try {
    const response = await fetch(`${apiUrl}/update-chat`, requestOptions);
    console.log("Chat Updated Successfully:", response);
  } catch (err) {
    console.log("Error in Updating chat :", err);
  }
}

export async function fetchChatDataFromServer(loggedUserId: string) {
  const requestOptions: requestOptionsType = {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": loggedUserId, // Include user ID in headers
    },
  };

  try {
    const response = await fetch(`${apiUrl}/get-chat`, requestOptions);
    const { data } = await response.json();
    console.log("Chat Data Fetched Successfully:", data);
    return data;
  } catch (err) {
    console.log("Error in Updating chat :", err);
  }
}
