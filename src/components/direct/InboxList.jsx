import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Avatar, Box, Button } from "@mui/material";
import customAxios from "@/utils/customAxios.js";
import AppContext from "@/context/app/AppContext";
import SocketContext from "@/context/socket/SocketContext";
import UserContext from "@/context/user/UserContext";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";

const InboxList = () => {
  const navigate = useNavigate();

  const { isMobile } = useContext(AppContext);
  const { socket, inboxItems } = useContext(SocketContext);
  const { userInfo } = useContext(UserContext);
  const [usersList, setUsersList] = useState([]);
  const [isUsersListModalOpen, setIsUsersListModalOpen] = useState(false);
  const [selectedUsersForNewRoom, setSelectedUsersForNewRoom] = useState([]);
  const fiyoauthApiBaseUri = import.meta.env.VITE_FIYOAUTH_API_BASE_URI;
  const fiyochatSrvBaseUri = import.meta.env.VITE_FIYOCHAT_SRV_BASE_URI;

  const getUsersListForNewChatRoom = async () => {
    setIsUsersListModalOpen(true);
    try {
      const { data } = await customAxios.get(`${fiyoauthApiBaseUri}/users`, {
        headers: {
          fiyoat: JSON.parse(localStorage.getItem("userInfo")).tokens.at,
        },
      });

      setUsersList(data.data);
    } catch (error) {
      throw new Error(`Error in getUsersList: ${error}`);
    }
  };

  const createChatRoom = async (memberIds) => {
    try {
      const { data } = await customAxios.post(
        `${fiyochatSrvBaseUri}/api/v1/rooms/create`,
        {
          roomType: "private",
          memberIds,
        },
        {
          headers: {
            fiyoat: JSON.parse(localStorage.getItem("userInfo")).tokens.at,
          },
        }
      );
      setIsUsersListModalOpen(false);
      window.location.href = `/direct/t/${data.data.roomId}`;
    } catch (error) {
      throw new Error(`Error in createChatRoom: ${error}`);
    }
  };
  

  const deleteChatRoom = async (collectionName) => {
    try {
      await customAxios.delete(`${fiyochatSrvBaseUri}/api/v1/rooms/delete`, {
        headers: {
          fiyoat: JSON.parse(localStorage.getItem("userInfo")).tokens.at,
        },
      });

      navigate(`/direct/inbox`);
      setIsUsersListModalOpen(false);
    } catch (error) {
      throw new Error(`Error in deleteChatRoom: ${error}`);
    }
  };

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
                  Start chatting
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
                <span className="text-gray-500">
                  &nbsp;{item?.lastLog?.timing}
                </span>
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
        <p className="text-gray-500">No messages yet.</p>
      </div>
    );
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "10px",
    boxShadow: 24,
    p: 0,
    maxHeight: "40%",
    overflowY: "scroll",
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
        onSecondIconClick={getUsersListForNewChatRoom}
      />
      <b className="px-3">Messages</b>
      <div className="px-3 py-2">
        {inboxItems.length > 0 ? renderInbox() : renderDefaultInbox()}
      </div>
      <Modal
        open={isUsersListModalOpen}
        onClose={() => setIsUsersListModalOpen(false)}
        className="flex items-center justify-center"
      >
        <Box className="fixed flex items-center justify-center">
          <div className="bg-gray-950 rounded-lg shadow-lg w-80 p-6 space-y-6 relative">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-200">
                Create a Private Chat
              </h2>
            </div>
            <div className="flex">
              {selectedUsersForNewRoom.length > 0 && (
                <div className="flex justify-between pr-5 rounded-lg">
                  <div className="relative flex flex-col items-center">
                    <Avatar
                      src={selectedUsersForNewRoom[0].avatar}
                      className="mb-2 mr-2"
                      sx={{ width: 50, height: 50 }}
                      alt="User Avatar"
                    />
                    <p
                      className="text-gray-200 absolute top-0 right-0 py-[.1rem] bg-gray-800/90 px-2 z-10 rounded-full cursor-pointer"
                      onClick={() => setSelectedUsersForNewRoom([])}
                    >
                      &times;
                    </p>
                    <p className="text-gray-500 text-xs">
                      @{selectedUsersForNewRoom[0].username}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <hr />
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {usersList
                .filter(
                  (user) =>
                    user.id !== JSON.parse(localStorage.getItem("userInfo")).id,
                )
                .filter(
                  (user) =>
                    !selectedUsersForNewRoom.some(
                      (selectedUser) => selectedUser.id === user.id,
                    ),
                )
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-white bg-blue-500 px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                      onClick={() => setSelectedUsersForNewRoom([user])}
                    >
                      Select
                    </button>
                  </div>
                ))}
            </div>

            {/* Create Button */}
            <button
              className="w-full bg-blue-500 text-gray-50 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 disabled:bg-blue-900 disabled:cursor-not-allowed disabled:text-gray-500"
              onClick={() =>
                createChatRoom([selectedUsersForNewRoom[0].id, userInfo.id])
              }
              disabled={selectedUsersForNewRoom.length === 0}
            >
              Create Chat Room
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default InboxList;
