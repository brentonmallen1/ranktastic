
import { Navigate } from "react-router-dom";
import { canCreatePoll } from "@/lib/auth";

interface ProtectedCreatePollProps {
  children: React.ReactNode;
}

const ProtectedCreatePoll = ({ children }: ProtectedCreatePollProps) => {
  if (!canCreatePoll()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedCreatePoll;
