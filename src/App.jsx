// App.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import LoginPage from "./loginPage";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitialized(true);
    });

    return unsubscribe;
  }, []);

  const handleSuccess = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <LoginPage onLoginSuccess={handleSuccess} />;
}

export default App;