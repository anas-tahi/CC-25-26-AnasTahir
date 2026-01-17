// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // If user is still null (token exists but not yet fetched), show a blank div to prevent flicker
  if (user === null) {
    return <div />; // could also add a spinner if you want
  }

  // If no user after fetch, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User exists, render protected content
  return children;
};

export default ProtectedRoute;
