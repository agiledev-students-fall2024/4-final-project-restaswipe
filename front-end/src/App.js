// src/App.js

/* eslint-disable no-unused-vars */

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "../src/contexts/AuthContext";
import { AccountInfoProvider } from "./contexts/AccountInfoContext";
import { SwipableFeedProvider } from "./contexts/SwipableFeedContext";
import { SelectedRestaurantProvider } from "./contexts/SelectedRestaurantContext";
import "./App.css";
 // import { LocationProvider } from "./contexts/LocationContext"; // TODO


function App() {
  return (
    // <LocationProvider> // TODO
      <AccountInfoProvider>
        <AuthProvider>
          <SwipableFeedProvider>
            <SelectedRestaurantProvider>
              <Router>
                <AppRoutes />
              </Router>
            </SelectedRestaurantProvider>
          </SwipableFeedProvider>
        </AuthProvider>
      </AccountInfoProvider>
    // </LocationProvider>
  );
}

export default App;
