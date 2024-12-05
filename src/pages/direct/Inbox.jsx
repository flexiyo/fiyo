import { useState, useEffect, useContext } from "react";
import matchMedia from "matchmedia";
import InboxList from "@/components/direct/InboxList";

const Inbox = () => {
  document.title = "Inbox • Chats";

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

  return (
    <section id="inbox" className="flex border-r-gray-500">
      {isMobile ? (
        <InboxList />
      ) : (
        <>
          <InboxList />
          <div
            className="flex flex-col justify-center items-center h-screen w-full"
          >
            <svg
              className="chat-icon w-28 h-28 p-6 border-4 border-white rounded-full"
              title="Chat with your mates"
              fill="#fff"
              role="img"
              viewBox="0 0 24 24"
            >
              <g fill="none" stroke="#ffffff" strokeWidth="1.5">
                <path d="M20 12c0-3.771 0-5.657-1.172-6.828C17.657 4 15.771 4 12 4C8.229 4 6.343 4 5.172 5.172C4 6.343 4 8.229 4 12v6c0 .943 0 1.414.293 1.707C4.586 20 5.057 20 6 20h6c3.771 0 5.657 0 6.828-1.172C20 17.657 20 15.771 20 12z"></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 10h6m-6 4h3"
                ></path>
              </g>
            </svg>
            <br />
            <p className="text-gray-500">
              Click &nbsp;<kbd className="fal fa-pen-to-square p-2 rounded-full"></kbd>&nbsp; to create a room and start chatting.
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default Inbox;
