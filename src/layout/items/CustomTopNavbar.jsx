import React from "react";
import { Link } from "react-router-dom";
const CustomTopNavbar = ({
  navbarPrevPage,
  navbarCover,
  navbarTitle,
  navbarFirstIcon,
  navbarSecondIcon,
  onSecondIconClick,
  setBorder,
}) => {
  return (
    <div
      className={`custom-top-navbar ${setBorder && "border-b border-gray-700"}`}
    >
      <div className="custom-top-navbar--left">
        {navbarPrevPage ? (
          <Link to={navbarPrevPage}>
            <i className="fm-small-icon far fa-arrow-left"></i>
          </Link>
        ) : null}
        {navbarCover ? (
          <img
            src={navbarCover}
            className="custom-top-navbar--left-cover"
            alt="navbar-cover"
          />
        ) : null}
        <b className="custom-top-navbar--left-username">{navbarTitle}</b>
      </div>
      <div className="custom-top-navbar--right">
        <div className="custom-top-navbar--right-icon">
          <i className={navbarFirstIcon}></i>
        </div>
        <div className="custom-top-navbar--right-icon" onClick={onSecondIconClick}>
          <i className={navbarSecondIcon}></i>
        </div>
      </div>
    </div>
  );
};

export default CustomTopNavbar;
