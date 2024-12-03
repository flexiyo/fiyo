import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { createSocket } from "@/hooks/user/useSocketService.js";
import UserContext from "@/context/user/UserContext";
import { getBulkUsersDetails } from "../../utils/user/getBulkUsersDetails";
import {
  initializeMessageStock,
  updateMessageStocks,
  getLastLog,
} from "@/utils/chat/messageUtils.js";

const SOCKET_URL = import.meta.env.VITE_FIYOCHAT_SRV_BASE_URI;
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { userInfo, isUserAuthenticated } = useContext(UserContext);
  const [socketUser, setSocketUser] = useState({
    id: null,
  });
  const [inboxItems, setInboxItems] = useState([]);

  let socketRef = useRef(null);
  const initialized = useRef(false);

  const fiyoauthApiBaseUri = import.meta.env.VITE_FIYOAUTH_API_BASE_URI;

  useEffect(() => {
    if (!isUserAuthenticated) {
      if (socketRef.current) {
        console.log("Disconnecting socket for unauthenticated user");
        socketRef.current?.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      console.log("Creating new socket connection");
      socketRef.current = createSocket(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
          fiyoat: userInfo.tokens.at,
        },
      });

      if (!initialized.current) {
        socketRef.current?.on("connect", () => {
          console.log("Socket Connected:", socketRef.current?.id);
          setSocketUser((prevState) => ({
            ...prevState,
            id: socketRef.current?.id,
          }));
        });

        socketRef.current?.on("roomsListResponse", async (response) => {
          const inboxItems = await Promise.all(
            response.map(async (room) => {
              if (room.roomDetails.type !== "private") {
                return room;
              }
        
              const lastLog = await getLastLog(room.messageStock, userInfo.id);

              const existingMessageStocks = JSON.parse(sessionStorage.getItem("messageStocks")) || {};
              
              const updatedMessageStocks = {
                ...existingMessageStocks,
                [room.roomDetails.id]: room.messageStock,
              };
              sessionStorage.setItem("messageStocks", JSON.stringify(updatedMessageStocks));
        
              room.lastLog = lastLog;
              delete room.messageStock;
        
              return room;
            }),
          );
        
          const recipientUserIds = response.flatMap((room) =>
            room.roomDetails.members
              .filter((member) => member !== userInfo.id)
              .map((member) => member),
          );
        
          const recipientUsers = await getBulkUsersDetails(recipientUserIds);
        
          inboxItems.forEach((item) => {
            item.recipientUser = recipientUsers.find(
              (user) =>
                item.roomDetails.members.includes(user.id) &&
                user.id !== userInfo.id,
            );
          });
        
          setInboxItems(inboxItems);
        });
        

        socketRef.current?.on("message_received", async (response) => {
          const { id, senderId, content, type, roomId, sentAt } = response;

          const messageStock = initializeMessageStock(roomId);
          const newMessage = {
            senderId,
            content,
            id,
            type,
            sentAt,
          };
          messageStock.messages.push(newMessage);

          const updatedStock = updateMessageStocks(roomId, messageStock);

          const lastLog = await getLastLog(updatedStock, userInfo.id);
          setInboxItems((prev) =>
            prev.map((item) =>
              item?.roomDetails?.id === roomId ? { ...item, lastLog } : item,
            ),
          );
        });

        socketRef.current?.on("message_seen", async (response) => {
          const { id, senderId, roomId, seenAt } = response;

          const messageStock = initializeMessageStock(roomId);

          const senderIndex = messageStock.seenBy.findIndex(
            (user) => user.userId === senderId,
          );

          if (senderIndex !== -1) {
            messageStock.seenBy[senderIndex].lastSeenMessageId = id;
            messageStock.seenBy[senderIndex].seenAt = seenAt;
          } else {
            messageStock.seenBy.push({
              userId: senderId,
              lastSeenMessageId: id,
              seenAt,
            });
          }

          const updatedStock = updateMessageStocks(roomId, messageStock);

          const lastLog = await getLastLog(updatedStock, userInfo.id);
          setInboxItems((prev) =>
            prev.map((item) =>
              item?.roomDetails?.id === roomId ? { ...item, lastLog } : item,
            ),
          );
        });

        socketRef.current?.on("error", async (response) => {
          if (response.error.name === "ATInvalidError") {
            const { data } = await axios.get(
              `${fiyoauthApiBaseUri}/tokens/check`,
              {
                headers: {
                  fiyoat: JSON.parse(localStorage.getItem("userInfo")).tokens
                    .at,
                  fiyort: JSON.parse(localStorage.getItem("userInfo")).tokens
                    .rt,
                },
              },
            );
            localStorage.setItem(
              "userInfo",
              JSON.stringify({
                ...JSON.parse(localStorage.getItem("userInfo")),
                tokens: {
                  at: data.data.at,
                  rt: data.data.rt,
                },
              }),
            );
          }
        });

        socketRef.current?.on("disconnect", () => {
          console.log("Socket Disconnected:", socketRef.current?.id);
        });

        initialized.current = true;
      }
    }
  }, [isUserAuthenticated, userInfo]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        socketUser,
        inboxItems,
        setInboxItems,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
