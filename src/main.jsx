import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import { LibraryProvider } from "./LibraryContext";
import { BooksProvider } from "./BooksContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BooksProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </BooksProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
