import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppProvider } from "./app/AppContext";
import { UserProvider } from "./user/UserContext";
import { SocketProvider } from "./socket/SocketContext";
import { MusicProvider } from "./music/MusicContext";
import { CreateProvider } from "./create/CreateContext";

const ContextProviders = ({ children }) => {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <ThemeProvider theme={darkTheme}>
      <AppProvider>
        <UserProvider>
          <SocketProvider>
            <MusicProvider>
              <CreateProvider>{children}</CreateProvider>
            </MusicProvider>
          </SocketProvider>
        </UserProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default ContextProviders;
