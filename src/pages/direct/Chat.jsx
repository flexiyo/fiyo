import React, { useRef, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Snowflake from "snowflake-id";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";
import InboxList from "@/components/direct/InboxList";
import UserFilesSheet from "@/components/direct/chat/UserFilesSheet";
import UserContext from "@/context/user/UserContext";
import SocketContext from "@/context/socket/SocketContext";
import {
  initializeMessageStock,
  updateMessageStocks,
} from "@/utils/chat/messageUtils.js";
import { getLastLog } from "../../utils/chat/messageUtils";

const Chat = () => {
  const { socket, inboxItems, setInboxItems } = useContext(SocketContext);
  const { userInfo } = useContext(UserContext);
  const [roomDetails, setRoomDetails] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [inputText, setInputText] = useState("");
  const inputMessageRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isUserFilesSheetOpen, setIsUserFilesSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { roomId } = useParams();
  const snowflake = new Snowflake();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 950px)");
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    setIsMobile(mediaQuery.matches);

    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  useEffect(() => {
    document.title = `Chats • Flexiyo`;

    if (!roomId || inboxItems.length === 0) return;

    const room = inboxItems.find((item) => item.roomDetails.id === roomId);
    if (!room) return;

    const { recipientUser, roomDetails } = room;
    const { messages: roomMessages } = initializeMessageStock(roomId);

    setRecipientInfo(recipientUser);
    setRoomDetails(roomDetails);
    setMessages(roomMessages);
    inputMessageRef.current?.focus();
  }, [roomId, inboxItems]);

  const markMessagesAsSeen = async (lastUnseenMessage) => {
    const messageStock = initializeMessageStock(roomId);
    const userIndex = messageStock.seenBy.findIndex(
      (user) => user.userId === userInfo.id,
    );

    if (
      (userIndex !== -1 &&
        messageStock.seenBy[userIndex].lastSeenMessageId ===
          lastUnseenMessage.id) ||
      lastUnseenMessage.senderId === userInfo.id
    ) {
      return;
    }

    const newDate = new Date();

    socket?.emit("see_message", {
      roomId,
      senderId: userInfo.id,
      id: lastUnseenMessage.id,
      seenAt: newDate,
    });

    if (userIndex !== -1) {
      messageStock.seenBy[userIndex].lastSeenMessageId = lastUnseenMessage.id;
      messageStock.seenBy[userIndex].seenAt = newDate;
    } else {
      messageStock.seenBy.push({
        userId: userInfo.id,
        lastSeenMessageId: lastUnseenMessage.id,
        seenAt: newDate,
      });
    }

    const updatedStock = updateMessageStocks(roomId, messageStock);

    const lastLog = await getLastLog(updatedStock, userInfo.id);
    setInboxItems((prev) =>
      prev.map((item) =>
        item?.roomDetails?.id === roomId ? { ...item, lastLog } : item,
      ),
    );
  };

  useEffect(() => {
    const handleLiveMessageSeen = (response) => {
      markMessagesAsSeen(response);
    };

    socket?.on("message_received", handleLiveMessageSeen);

    return () => socket?.off("message_received", handleLiveMessageSeen);
  }, [roomId, socket, userInfo]);

  useEffect(() => {
    let isMounted = true;

    const handleOpenChatMessagesSeen = () => {
      if (!roomId || !isMounted) return;

      const messageStock = initializeMessageStock(roomId);
      markMessagesAsSeen(messageStock.messages.at(-1));
    };

    handleOpenChatMessagesSeen();

    return () => {
      isMounted = false;
    };
  }, [roomId, userInfo]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (inputText.trim() === "") return;

    const id = snowflake.generate();
    const newMessage = {
      id: id,
      senderId: userInfo.id,
      content: inputText,
      type: "text",
      sentAt: new Date(),
    };
    const messageStock = initializeMessageStock(roomId);
    messageStock.messages.push(newMessage);

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const updatedStock = updateMessageStocks(roomId, messageStock);

    const lastLog = await getLastLog(updatedStock, userInfo.id);
    setInboxItems((prev) =>
      prev.map((item) =>
        item?.roomDetails?.id === roomId ? { ...item, lastLog } : item,
      ),
    );

    socket?.emit("send_message", {
      roomId,
      senderId: userInfo.id,
      ...newMessage,
    });

    setInputText("");
  };

  const scrollToBottom = () => {
    const chatDiv = document.getElementById("chat-messages");
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
  };

  useEffect(scrollToBottom, [messages]);

  const openUserFilesSheet = () => setIsUserFilesSheetOpen(true);
  const closeUserFilesSheet = () => setIsUserFilesSheetOpen(false);

  return (
    <section id="chat">
      <UserFilesSheet
        isUserFilesSheetOpen={isUserFilesSheetOpen}
        setIsUserFilesSheetOpen={setIsUserFilesSheetOpen}
      />
      {!isMobile && <InboxList />}
      <div className="chat-area">
        <CustomTopNavbar
          navbarPrevPage={isMobile ? "/direct/inbox" : null}
          navbarCover={roomDetails?.avatar || recipientInfo?.avatar}
          navbarTitle={
            roomDetails?.name ||
            recipientInfo?.full_name ||
            recipientInfo?.username
          }
          navbarFirstIcon="fa fa-phone"
          navbarSecondIcon="fa fa-video"
          setBorder
        />
        <div id="chat-messages" className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message--${
                message.senderId !== userInfo.id ? "other" : "self"
              }`}
            >
              {message.senderId !== userInfo.id && (
                <LazyLoadImage
                  src={recipientInfo?.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <span msg-type="text">{message.content}</span>
            </div>
          ))}
        </div>
        <div className="chat-messenger">
          <form className="chat-messenger-box" onSubmit={handleSendMessage}>
            <div className="chat-messenger--left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                fill="none"
                viewBox="0 0 24 24"
                onClick={openUserFilesSheet}
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M9 7a5 5 0 0 1 10 0v8a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v6a5 5 0 0 0 10 0V7a3 3 0 1 0-6 0v8a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v6a3 3 0 1 1-6 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="chat-messenger--center">
              <input
                ref={inputMessageRef}
                type="text"
                placeholder="Message"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <button
              className="chat-messenger--right"
              type="submit"
              disabled={!inputText}
            >
              <i className="fa fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Chat;
