import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import matchMedia from "matchmedia";
import SocketContext from "@/context/socket/SocketContext";
import UserContext from "@/context/user/UserContext";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";

const InboxList = () => {
  const { socket, inboxItems } = useContext(SocketContext);
  const { userInfo } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = matchMedia("(max-width: 950px)");
    const handleMediaQueryChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    mediaQuery.addListener(handleMediaQueryChange);
    handleMediaQueryChange();

    return () => {
      mediaQuery.removeListener(handleMediaQueryChange);
    };
  }, []);

  const renderInbox = () => {
    return inboxItems.map((item) => {
      if (!item?.lastLog) {
        return (
          <Link
            to={`/direct/t/${item?.roomDetails?.id}`}
            key={item?.roomDetails?.id}
          >
            <div className="flex flex-row mb-3 py-1">
              <img
                alt="User avatar"
                className="w-12 h-12 rounded-full mr-3 object-cover"
                src={item?.avatar || item?.recipientUser?.avatar}
              />
              <div className="flex flex-col w-full">
                <label className="text-sm text-white">
                  {item?.name ||
                    item?.recipientUser?.full_name ||
                    item?.recipientUser?.username}
                </label>
                <span className="text-sm mt-1 text-slate-500">
                  Start chatting now.
                </span>
              </div>
            </div>
          </Link>
        );
      }

      return (
        <Link
          to={`/direct/t/${item?.roomDetails.id}`}
          key={item?.roomDetails.id}
        >
          <div className="flex flex-row mb-3 py-1">
            <img
              alt="User avatar"
              className="w-12 h-12 rounded-full mr-3 object-cover"
              src={item?.avatar || item?.recipientUser?.avatar}
            />
            <div className="flex flex-col w-full">
              <label className="text-sm text-white">
                {item?.name ||
                  item?.recipientUser?.full_name ||
                  item?.recipientUser?.username}
              </label>
              <span className="text-sm mt-1">
                <span className={`${item?.lastLog?.color} break-words`}>
                  {item?.lastLog?.content}
                </span>
                <span className="text-gray-500">&nbsp;{item?.lastLog?.timing}</span>
              </span>
            </div>
          </div>
        </Link>
      );
    });
  };

  const renderDefaultInbox = () => {
    return (
      <div className="flex flex-row mb-3 py-1 justify-center items-center text-slate-500 h-96 w-full">
        <h1>Create or join rooms to start chatting.</h1>
      </div>
    );
  };

  return (
    <div
      className="max-w-80 w-full border-r border-gray-700"
      style={isMobile ? { maxWidth: "100%" } : { maxWidth: "20rem" }}
    >
      <CustomTopNavbar
        navbarPrevPage={isMobile ? "/" : null}
        navbarTitle={userInfo.username}
        navbarSecondIcon="fal fa-pen-to-square"
      />
      <b className="px-3">Messages</b>
      <div className="px-3 py-2">
        {inboxItems.length > 0 ? renderInbox() : renderDefaultInbox()}
      </div>
    </div>
  );
};

export default InboxList;
