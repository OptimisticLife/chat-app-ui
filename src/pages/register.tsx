import { useState } from "react";
import useNav from "../hooks/navigate";
import LoadingButton from "../components/loadingbtn";
const apiUrl = import.meta.env.VITE_API_URL;

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNav();

  const registerBtnHandler = async () => {
    setIsLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        email,
        password,
      }),
    };

    try {
      const apiResponse = await fetch(`${apiUrl}/create-user`, requestOptions);
      const response = await apiResponse.json();
      console.log("User Created:", response);

      setIsLoading(false);
      if (apiResponse.ok) {
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        if (apiResponse.status === 409) {
          setRegisterStatus("Username or Email already exist.");
        } else {
          setRegisterStatus("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  return (
    <div className="register">
      <p className="register-title section-title ">Register for Chat-4647</p>
      <div className="register-form">
        <input
          type="text"
          placeholder="UserName"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />
        <input
          type="email"
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
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
        />

        <LoadingButton
          id="register-btn"
          btnHandler={registerBtnHandler}
          isDisabled={
            !userName ||
            !email ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
          label="Register"
          isLoading={isLoading} // Assuming you don't have a loading state for this button
        />
        {registerStatus && <p className="status">{registerStatus}</p>}
        <p className="info">
          Already Registered with us?. Kindly{" "}
          <a href="/login" className="info-link">
            login
          </a>{" "}
          .
        </p>
      </div>
    </div>
  );
}
