import { useState, useEffect, useContext } from "react";
import BottomNavbar from "./items/BottomNavbar";
import SideNavbar from "./items/SideNavbar";
import AppContext from "@/context/app/AppContext";
import UserContext from "@/context/user/UserContext";

const Navbar = () => {
  const { isMobile } = useContext(AppContext);
  const { isUserAuthenticated } = useContext(UserContext);
  return isUserAuthenticated ? (
    <>
      {isMobile ? (
        <>
          <BottomNavbar />
        </>
      ) : (
        <SideNavbar />
      )}
    </>
  ) : null;
};

export default Navbar;
