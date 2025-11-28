import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    if (user) {
      navigate("/home");
    } else {
      navigate("/sign-in");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/sign-in");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={handleLogoClick}>
        <h1 className="navbar-logo">Library Catalog AI</h1>
      </div>

      <div className="navbar-links">
        {user ? (
          <>
            <button
              className={`nav-link ${isActive("/home") ? "active" : ""}`}
              onClick={() => handleNavClick("/home")}
            >
              Home
            </button>
            <button
              className={`nav-link ${
                isActive("/advanced-search") ? "active" : ""
              }`}
              onClick={() => handleNavClick("/advanced-search")}
            >
              Advanced Search
            </button>
            <button
              className={`nav-link ${
                isActive("/book-details") ||
                location.pathname.startsWith("/book/")
                  ? "active"
                  : ""
              }`}
              onClick={() => handleNavClick("/book-details")}
            >
              Book Details
            </button>
            <button
              className={`nav-link ${
                isActive("/resources") ? "active" : ""
              }`}
              onClick={() => handleNavClick("/resources")}
            >
              Resources
            </button>
            <button
              className={`nav-link ${
                isActive("/my-library") ? "active" : ""
              }`}
              onClick={() => handleNavClick("/my-library")}
            >
              My Library
            </button>

            
            <span className="nav-user-email">
              {user.displayName || "BC User"}
            </span>


            <button className="nav-link signout-link" onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-link ${
                isActive("/sign-in") || isActive("/") ? "active" : ""
              }`}
              onClick={() => handleNavClick("/sign-in")}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

