import React, { useContext, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SwipableFeed from "./components/SwipableFeed";
import ProfilePage from "./components/Profile";
import Login from "./Login";
import { AuthContext } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Settings from "./components/Settings";

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filters, setFilters] = useState({});

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? (
            <Navigate to="/feed" replace />
          ) : (
            <Login/>
          )} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/feed" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/feed"
        element={
          isAuthenticated ? (
            <>
              <Navbar setFilters={setFilters} setSelectedRestaurant={setSelectedRestaurant} />
              <SwipableFeed filters={filters} selectedRestaurant={selectedRestaurant} />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <>
              <Navbar />
              <ProfilePage />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path='/settings'
        element={
          isAuthenticated ? (
            <>
              <Navbar/>
              <Settings/>
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
