import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { BookProvider } from "./contexts/BookContext";
import App from "./App";
import "./index.css";

// Konfigurasi future flags untuk React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router future={router.future}>
      <BookProvider>
        <App />
      </BookProvider>
    </Router>
  </StrictMode>
);
