import { Capacitor } from "@capacitor/core";
import { createContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(
    Capacitor.getPlatform() === "android" || false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <AppContext.Provider value={{ isMobile, setIsMobile }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
