import "./App.css";
import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import {
  Home,
  Search,
  Create,
  Clips,
  Profile,
  Music,
  DirectInbox,
  DirectChat,
  Stories,
  Notifications,
  AuthSignup,
  NotFound404,
} from "./pages";

import Navbar from "./layout/Navbar";
import TrackPlayer from "./components/music/TrackPlayer";
import DirectChatNotification from "./components/direct/chat/ChatNotification";
import LoadingScreen from "./components/app/LoadingScreen";
import UserContext from "./context/user/UserContext";
import NotConnectedToInternet from "./components/app/NotConnectedToInternet";

const App = () => {
  document.title = "Flexiyo";
  const [appLoading, setAppLoading] = useState(true);
  const { loading } = useContext(UserContext);
  const [connectedToInternet, setConnectedToInternet] = useState(
    navigator.onLine,
  );

  useEffect(() => {
    const updateOnlineStatus = () => {
      setConnectedToInternet(navigator.onLine);
      if (navigator.onLine) {
        window.location.reload();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const noSelectElements = document.querySelectorAll("#main");
    noSelectElements.forEach((element) => {
      element.style.webkitUserSelect = "none";
      element.style.mozUserSelect = "none";
      element.style.msUserSelect = "none";
      element.style.userSelect = "none";
    });

    window.addEventListener("popstate", () => {
      window.history.back();
    });    

    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAppLoading(false);
    };

    initializeApp();
  }, []);

  if (appLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <DirectChatNotification />
      <TrackPlayer />
      <Routes>
        <Route
          path="*"
          element={
            connectedToInternet ? <NotFound404 /> : <NotConnectedToInternet />
          }
        />
        <Route
          exact
          path="/auth/signup"
          lazy={true}
          element={
            connectedToInternet ? <AuthSignup /> : <NotConnectedToInternet />
          }
        />
        <Route
          index
          exact
          path="/"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
        <Route
          exact
          path="/search"
          lazy={true}
          element={
            connectedToInternet ? <Search /> : <NotConnectedToInternet />
          }
        />
        <Route
          exact
          path="/music"
          lazy={true}
          element={<Music connectedToInternet={connectedToInternet} />}
        />
        <Route
          exact
          path="/stories"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <Stories />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
        <Route
          exact
          path="/notifications"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
        <Route
          exact
          path="/direct/inbox"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <DirectInbox />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
        <Route
          exact
          path="direct/t/:roomId"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <DirectChat />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
        <Route
          exact
          path="/create"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
        <Route
          exact
          path="/clips"
          lazy={true}
          element={connectedToInternet ? <Clips /> : <NotConnectedToInternet />}
        />
        <Route
          path="/profile"
          lazy={true}
          element={
            connectedToInternet ? (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ) : (
              <NotConnectedToInternet />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
