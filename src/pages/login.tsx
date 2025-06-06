import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import useNav from "../hooks/navigate";
import LoadingButton from "../components/loadingbtn";

const apiUrl = import.meta.env.VITE_API_URL;

type requestOptionsType = {
  method: string;
  credentials: RequestCredentials;
  headers: {
    "Content-Type": string;
  };
  body?: string;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { navigate } = useNav();
  const [loginStatus, setLoginStatus] = useState("");
  const { isAuthenticated, refreshAuthStatus, setLoggedUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("isAuthenticated from Login:", isAuthenticated);
    if (isAuthenticated) {
      navigate("/"); // Redirect to the dashboard
    }
  }, [isAuthenticated, navigate]);

  const loginBtnHandler = async () => {
    setIsLoading(true);
    const requestOptions: requestOptionsType = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    };

    try {
      const response = await fetch(`${apiUrl}/login`, requestOptions);
      const { data } = await response.json();

      setIsLoading(false);

      console.log("Data from the server:", data);
      if (response.ok) {
        setLoginStatus("");
        refreshAuthStatus();
        if (data.name) {
          console.log("User logged:", data.name);
          setLoggedUser(data);
          localStorage.setItem("loggedUser", JSON.stringify(data));
        }
        console.log("Login successful");
        navigate("/");
        // Redirect to the dashboard
      } else {
        if (response.status === 401) {
          setLoginStatus("Invalid email or password.");
        } else {
          setLoginStatus("An error occurred. Please try again.");
        }
      }
    } catch (err) {
      console.log("Error in logging in..", err);
    }
  };

  return (
    <div className="login">
      <p className="login-title section-title ">Login Chat-4647</p>
      <div className="login-form">
        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <LoadingButton
          id="login-btn"
          btnHandler={loginBtnHandler}
          isDisabled={!email || !password}
          isLoading={isLoading}
          label="Login"
        />
        {loginStatus && <p className="status">{loginStatus}</p>}
        {
          <p className="info">
            New user ? Kindly{" "}
            <a href="/register" className="info-link">
              register
            </a>{" "}
            with us.
          </p>
        }
      </div>
    </div>
  );
}
