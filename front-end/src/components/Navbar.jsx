import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { AuthContext } from "../contexts/AuthContext";
import FilterPopup from "./FilterPopup";

const Navbar = ({ setFilters, setSelectedRestaurant, filters }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleFilterClick = () => {
    setFilterOpen(true);
  };

  const handleBackClick = () => {
    navigate("/feed");
  };

  const isFeedPage = location.pathname === "/feed";

  const handleApplyFilters = (filters) => {
    setFilters(filters);
  };

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <>
      <nav className="nav-bar">
        <div className="toolbar">
          {isAuthenticated &&
            (isFeedPage ? (
              <button className="icon-button" onClick={handleFilterClick}>
                <span className="icon">🔍</span>
              </button>
            ) : (
              <button className="icon-button" onClick={handleBackClick}>
                <span className="icon">←</span>
              </button>
            ))}
          <h1 className="nav-title">Restaswipe</h1>
          {isAuthenticated && (
            <button className="icon-button" onClick={handleProfileClick}>
              <span className="icon">👤</span>
            </button>
          )}
        </div>
      </nav>
      {isFeedPage && (
        <FilterPopup
          open={filterOpen}
          close={() => setFilterOpen(false)}
          onSelectRestaurant={handleSelectRestaurant}
          onApplyFilters={handleApplyFilters}
          filters={filters}
        />
      )}
    </>
  );
};

export default Navbar;