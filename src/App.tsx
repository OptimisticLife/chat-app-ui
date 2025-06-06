import { Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import { AuthProvider } from "./context/authProvider";
import ProtectedRoute from "./components/protectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
export default App;
