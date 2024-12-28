import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import UserContext from "@/context/user/UserContext";
import MusicContext from "@/context/music/MusicContext";

export default function BottomNavbar() {
  const { userInfo } = useContext(UserContext);
  const { isAudioPlaying } = useContext(MusicContext);
  const withoutBottomNavbarRoutes = [
    "create",
    "/notifications",
    "/inbox",
    "/direct/t/",
  ];
  const { pathname } = useLocation();

  if (withoutBottomNavbarRoutes.some((item) => pathname.includes(item))) {
    return;
  }
  return (
    <>
      <div id="mobile-bottom-navbar" className="relative bg-gray-800">
        <span className="flex w-full h-full items-center justify-center">
          <NavLink
            className={({ isActive }) =>
              `home-icon-link ${isActive ? "active" : ""}`
            }
            to="/"
          >
            <svg
              className="home-icon"
              height="1.7rem"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="#ffffff"
                d="M13.45 2.533a2.25 2.25 0 0 0-2.9 0L3.8 8.228a2.25 2.25 0 0 0-.8 1.72v9.305c0 .966.784 1.75 1.75 1.75h3a1.75 1.75 0 0 0 1.75-1.75V15.25c0-.68.542-1.232 1.217-1.25h2.566a1.25 1.25 0 0 1 1.217 1.25v4.003c0 .966.784 1.75 1.75 1.75h3a1.75 1.75 0 0 0 1.75-1.75V9.947a2.25 2.25 0 0 0-.8-1.72z"
              ></path>
            </svg>
          </NavLink>
        </span>
        <span className="flex flex-grow w-full h-full items-center justify-center">
          <NavLink
            className={({ isActive }) =>
              `search-icon-link ${isActive ? "active" : ""}`
            }
            to="/search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="search-icon cursor-pointer"
              height="1.7rem"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </NavLink>
        </span>
        <span className="flex flex-grow w-full h-full items-center justify-center">
          <NavLink to="/music">
            {({ isActive }) => (
              <svg
              className={`music-icon cursor-pointer ${
                isActive ? "scale-110" : "scale-100"
              } ${isAudioPlaying && "animate-spin-slow"} duration-100`}
              height="2rem"
              fill="none"
              role="img"
              viewBox="0 0 512 512"
            >
                <circle
                  className={isActive ? "fill-red-600" : "fill-gray-600"}
                  cx="256"
                  cy="256"
                  r="256"
                />
                <path
                  className={isActive ? "fill-red-700" : "fill-gray-700"}
                  d="M295.726,508.899c51.721-8.082,101.443-32.028,141.293-71.878
        c43.525-43.525,68.093-98.826,73.719-155.648L367.011,137.645L248.53,170.667v37.838l-59.363-59.363l-7.873,7.73l-25.445,19.173
        l92.679,92.679v68.012l-40.545,23.39l-69.554-69.554l-15.17,10.538l-19.796,15.245l65.998,65.998l-0.179,0.103L295.726,508.899z"
                />
                <g>
                  <path
                    className="fill-white"
                    d="M312.889,271.082c0-6.902,5.596-12.497,12.498-12.497c6.902,0,12.498,5.596,12.498,12.497
          c0-6.902,5.596-12.497,12.498-12.497c6.903,0,12.498,5.596,12.498,12.497c0,11.95-24.997,26.245-24.997,26.245
          S312.889,283.707,312.889,271.082z"
                  />
                  <path
                    className="fill-white"
                    d="M142.222,157.305c0-6.903,5.596-12.497,12.498-12.497s12.498,5.596,12.498,12.497
          c0-6.903,5.596-12.497,12.498-12.497s12.498,5.596,12.498,12.497c0,11.95-24.997,26.245-24.997,26.245
          S142.222,169.929,142.222,157.305z"
                  />
                  <path
                    className="fill-white"
                    d="M92.229,299.527c0-6.903,5.596-12.497,12.498-12.497c6.903,0,12.498,5.596,12.498,12.497
          c0-6.903,5.596-12.497,12.498-12.497c6.903,0,12.498,5.596,12.498,12.497c0,11.95-24.997,26.245-24.997,26.245
          S92.229,312.151,92.229,299.527z"
                  />
                </g>
                <path
                  className="fill-yellow-500"
                  d="M235.654,137.645v159.896c-17.496-7.651-41.294-2.098-58.633,15.243
        c-21.373,21.376-24.838,52.569-7.739,69.67s48.288,13.634,69.663-7.742c11.707-11.709,18.027-26.36,18.553-40.031h0.05v-153.25
        h65.679c24.183,0,43.785-19.604,43.785-43.785L235.654,137.645L235.654,137.645z"
                />
              </svg>
            )}
          </NavLink>
        </span>
        <span className="flex flex-grow w-full h-full items-center justify-center">
          <NavLink
            className={({ isActive }) =>
              `clips-icon-link ${isActive ? "active" : ""}`
            }
            to="/clips"
          >
            <svg
              className="clips-icon cursor-pointer"
              height="1.7rem"
              fill="currentColor"
              role="img"
              viewBox="0 0 16 16"
            >
              <path
                id="clipsPathNotActive"
                fill="#ffffff"
                d="m6 5.004l-.001 3.993a.5.5 0 0 0 .777.416l2.998-1.996a.5.5 0 0 0 0-.832L6.777 4.588A.5.5 0 0 0 6 5.004M2 4.25A2.25 2.25 0 0 1 4.25 2h6.5A2.25 2.25 0 0 1 13 4.25v5.5A2.25 2.25 0 0 1 10.75 12h-6.5A2.25 2.25 0 0 1 2 9.75zM4.25 3C3.56 3 3 3.56 3 4.25v5.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25v-5.5C12 3.56 11.44 3 10.75 3zM4 13c.456.607 1.182 1 2 1h5.25A3.75 3.75 0 0 0 15 10.25V6c0-.818-.393-1.544-1-2v6.25A2.75 2.75 0 0 1 11.25 13z"
              ></path>

              <path
                id="clipsPathActive"
                fill="#ffffff"
                d="M4.25 2A2.25 2.25 0 0 0 2 4.25v5.5A2.25 2.25 0 0 0 4.25 12h6.5A2.25 2.25 0 0 0 13 9.75v-5.5A2.25 2.25 0 0 0 10.75 2zM6 8.996V5.004a.5.5 0 0 1 .778-.416l2.997 1.996a.5.5 0 0 1 0 .833L6.777 9.413A.5.5 0 0 1 6 8.996M6 14a2.496 2.496 0 0 1-2-1h7.25A2.75 2.75 0 0 0 14 10.25V4c.607.456 1 1.182 1 2v4.25A3.75 3.75 0 0 1 11.25 14z"
              ></path>
            </svg>
          </NavLink>
        </span>
        <span className="flex flex-grow w-full h-full items-center justify-center">
          <NavLink
            className={({ isActive }) =>
              `user-profile-icon-link ${isActive ? "active" : ""}`
            }
            to="/profile"
          >
            <div className="user-profile-icon">
              <img
                alt="User"
                className="user-profile-icon"
                src={userInfo.avatar}
              />
            </div>
          </NavLink>
        </span>
      </div>
    </>
  );
}
