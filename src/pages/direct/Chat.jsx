import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Snowflake from "snowflake-id";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";
import InboxList from "@/components/direct/InboxList";
import UserFilesSheet from "@/components/direct/chat/UserFilesSheet";
import AppContext from "@/context/app/AppContext"
import UserContext from "@/context/user/UserContext";
import SocketContext from "@/context/socket/SocketContext";
import {
  initializeMessageStock,
  updateMessageStocks,
} from "@/utils/chat/messageUtils.js";
import { getLastLog } from "../../utils/chat/messageUtils";
import { Avatar } from "@mui/material";

const Chat = () => {

  const snowflake = new Snowflake();
  const chatDivRef = useRef(null);
  const inputMessageRef = useRef(null);

  const { isMobile } = useContext(AppContext);
  const { socket, inboxItems, setInboxItems } = useContext(SocketContext);
  const { userInfo } = useContext(UserContext);
  const [roomDetails, setRoomDetails] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [skipCount, setSkipCount] = useState(1);
  const [isUserFilesSheetOpen, setIsUserFilesSheetOpen] = useState(false);
  const { roomId } = useParams();

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

  useEffect(() => {
    const chatDiv = chatDivRef.current;

    const handleScroll = () => {
      if (chatDiv.scrollTop === 0) {
        socket?.emit("get_messages", {
          roomId,
          socketId: socket.id,
          skipCount,
        });
        setSkipCount((prev) => prev + 1);
      }
    };

    const handleReceivedMessages = (response) => {
      setMessages((prevMessages) => [
        ...response.messageStock.messages,
        ...prevMessages,
      ]);

      if (chatDiv) {
        chatDiv.scrollTop = chatDiv.scrollHeight - chatDiv.clientHeight;
      }
    };

    chatDiv?.addEventListener("scroll", handleScroll);
    socket.on("messages_got", handleReceivedMessages);

    return () => {
      chatDiv?.removeEventListener("scroll", handleScroll);
      socket?.off("messages_got", handleReceivedMessages);
    };
  }, [roomId, skipCount, socket]);

  const markMessagesAsSeen = async (lastUnseenMessage) => {
    const messageStock = initializeMessageStock(roomId);
    const userIndex = messageStock.seenBy.findIndex(
      (user) => user.userId === userInfo.id,
    );

    if (
      (userIndex !== -1 &&
        messageStock.seenBy[userIndex].lastSeenMessageId ===
          lastUnseenMessage?.id) ||
      lastUnseenMessage?.senderId === userInfo.id
    ) {
      return;
    }

    const newDate = new Date();

    socket?.emit("see_message", {
      roomId,
      senderId: userInfo.id,
      id: lastUnseenMessage?.id,
      seenAt: newDate,
    });

    if (userIndex !== -1) {
      messageStock.seenBy[userIndex].lastSeenMessageId = lastUnseenMessage?.id;
      messageStock.seenBy[userIndex].seenAt = newDate;
    } else {
      messageStock.seenBy.push({
        userId: userInfo.id,
        lastSeenMessageId: lastUnseenMessage?.id,
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
    // const chatDiv = document.getElementById("chat-messages");
    const chatDiv = chatDivRef.current;
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
        />
        <div
          ref={chatDivRef}
          className="flex w-full flex-col overflow-y-scroll pt-2 h-[calc(100vh-8.5rem)]"
          onClick={closeUserFilesSheet}
        >
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const isSelfMessage = message?.senderId === userInfo.id;
              const isSameSenderPrev =
                index > 0 &&
                messages[index - 1]?.senderId === message?.senderId;
              const isSameSenderNext =
                index < messages.length - 1 &&
                messages[index + 1]?.senderId === message?.senderId;

              const isFirstInBlock = !isSameSenderPrev;
              const isLastInBlock = !isSameSenderNext;
              const isSingleMessage = !isSameSenderPrev && !isSameSenderNext;

              const bgColor = isSelfMessage ? "bg-[#1572db]" : "bg-[#222933]";
              const baseClasses = "text-left py-2 px-3 break-words rounded-full";
              const borderRadius = isSingleMessage
                ? "rounded-full"
                : isSelfMessage
                ? isFirstInBlock
                  ? "rounded-br-md"
                  : isLastInBlock
                  ? "rounded-tr-md"
                  : "rounded-tr-md rounded-br-md"
                : isFirstInBlock
                ? "rounded-bl-md"
                : isLastInBlock
                ? "rounded-tl-md ml-11"
                : "rounded-tl-md rounded-bl-md ml-11";

              return (
                <div
                  key={message?.id}
                  className={`flex w-full px-3 pt-1 items-start ${
                    isSelfMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isSelfMessage && isFirstInBlock && (
                    <img
                      src={recipientInfo?.avatar}
                      className="w-9 h-9 rounded-full object-cover mr-2"
                    />
                  )}
                  <div className="flex flex-col max-w-[70%]">
                    {message?.type === "text" && (
                      <span
                        className={`${baseClasses} ${bgColor} ${borderRadius}`}
                      >
                        {message?.content}
                      </span>
                    )}
                    {index === messages.length - 1 &&
                      inboxItems.find((item) => item.roomDetails.id === roomId)
                        ?.lastLog.content === "Seen" && (
                        <span className="text-xs text-gray-500 mt-1 text-right">
                          Seen&nbsp;
                          {
                            inboxItems.find(
                              (item) => item.roomDetails.id === roomId,
                            )?.lastLog?.timing
                          }
                        </span>
                      )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col justify-center items-center">
              <Avatar
                src={recipientInfo?.avatar}
                className="mt-3"
                sx={{ width: 100, height: 100 }}
              ></Avatar>
              <p className="font-bold mt-2">{recipientInfo?.full_name}</p>
              <p className="text-gray-500 mt-2">@{recipientInfo?.username}</p>
              <button
                className="mt-3 bg-slate-800 py-2 px-3 rounded-md"
                onClick={() => navigate(`/profile/${recipientInfo?.username}`)}
              >
                View Profile
              </button>
              <p className="mt-5 text-gray-500">
                Send a message to get started.
              </p>
            </div>
          )}
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
