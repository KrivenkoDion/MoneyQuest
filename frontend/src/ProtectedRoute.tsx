import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = localStorage.getItem("currentUser");

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;