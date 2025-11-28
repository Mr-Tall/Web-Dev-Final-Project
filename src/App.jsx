import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdvancedSearch from "./pages/AdvancedSearch";
import BookDetails from "./pages/BookDetails";
import ResourcesPage from "./pages/ResourcesPage";
import MyLibrary from "./pages/MyLibrary";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./ProtectedRoute"; // we'll add this file
import "./App.css";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        {/* Default route: go to sign-in */}
        <Route path="/" element={<Navigate to="/sign-in" replace />} />

        
        <Route path="/sign-in" element={<SignIn />} />

        {/* Everything below requires login */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advanced-search"
          element={
            <ProtectedRoute>
              <AdvancedSearch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-details"
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-library"
          element={
            <ProtectedRoute>
              <MyLibrary />
            </ProtectedRoute>
          }
        />

        {/* Fallback: anything unknown → sign in */}
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </div>
  );
}

export default App;

