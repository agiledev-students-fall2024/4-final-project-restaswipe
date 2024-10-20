// src/App.js
import React, { useEffect, useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import SwipableFeed from "./components/SwipableFeed";
import ProfilePage from "./components/Profile";
import Login from "./Login";
import { AuthContext } from "../src/contexts/AuthContext";
import { AccountInfoProvider } from "./contexts/AccountInfoContext";
import "./App.css";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <AccountInfoProvider>
      <Router>
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/login" element={<Login />} />
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
                  <SwipableFeed />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <ProfilePage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </AccountInfoProvider>
  );
}

export default App;
