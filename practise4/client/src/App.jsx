import { useEffect, useState } from "react";
import { clearTokens, getCurrentUser, hasSession } from "./api";
import AdminUsersPage from "./pages/AdminUsersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";

function getCurrentPath() {
  return window.location.pathname || "/";
}

function navigate(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function App() {
  const [path, setPath] = useState(getCurrentPath());
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    function handleRouteChange() {
      setPath(getCurrentPath());
    }

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!hasSession()) {
        if (active) {
          setCurrentUser(null);
          setCheckingSession(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser();
        if (active) {
          setCurrentUser(user);
        }
      } catch {
        clearTokens();
        if (active) {
          setCurrentUser(null);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    navigate("/");
  }

  function handleRegisterSuccess() {
    navigate("/login");
  }

  function handleCurrentUserChange(user) {
    setCurrentUser(user);
  }

  function handleLogout() {
    clearTokens();
    setCurrentUser(null);
    navigate("/login");
  }

  if (checkingSession) {
    return null;
  }

  if (path === "/login") {
    if (currentUser) {
      navigate("/");
      return null;
    }
    return <LoginPage onSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (path === "/register") {
    if (currentUser) {
      navigate("/");
      return null;
    }
    return <RegisterPage onSuccess={handleRegisterSuccess} onNavigate={navigate} />;
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  if (path === "/admin/users") {
    if (currentUser.role !== "admin") {
      navigate("/");
      return null;
    }

    return (
      <AdminUsersPage
        currentUser={currentUser}
        onCurrentUserChange={handleCurrentUserChange}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    );
  }

  return (
    <UsersPage
      currentUser={currentUser}
      onCurrentUserChange={handleCurrentUserChange}
      onLogout={handleLogout}
      onNavigate={navigate}
    />
  );
}

export default App;
