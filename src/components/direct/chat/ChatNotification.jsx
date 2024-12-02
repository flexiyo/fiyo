import { useState, useEffect, useContext } from "react";
import UserContext from "@/context/user/UserContext";
import SocketContext from "@/context/socket/SocketContext";

const ChatNotification = () => {
  const { userInfo } = useContext(UserContext);
  const { socket, inboxItems, setInboxItems } = useContext(SocketContext);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ senderId, content, roomId }) => {
      if (senderId === userInfo.id) return;

      const room = inboxItems.find((item) => item?.roomDetails?.id === roomId);
      if (!room) return;

      const { avatar, username } = room?.recipientUser || {};

      setNotification({ cover: avatar, title: username, content });
      setTimeout(() => setNotification(null), 2500);
    };

    socket.on("message_received", handleReceiveMessage);

    return () => {
      socket.off("message_received", handleReceiveMessage);
    };
  }, [socket, userInfo.id, inboxItems, setInboxItems]);

  return (
    <div
      className={`fixed flex justify-around items-center w-full top-[-5rem] h-20 p-3 bg-[--fm-tertiary-bg-color] z-50 transition-all duration-200 ease-in-out ${
        notification ? "top-0" : ""
      }`}
    >
      {notification && (
        <>
          <img
            src={notification.cover}
            className="w-14 h-14 rounded-full"
            alt="Notification Avatar"
          />
          <div className="flex flex-col w-full mx-4">
            <span className="text-[--fm-primary-text] text-base truncate">
              {notification.title}
            </span>
            <span className="text-gray-400 text-base truncate mt-1.5">
              {notification.content}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatNotification;
