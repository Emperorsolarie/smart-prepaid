import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, isLoading, children}){
    if (isLoading){
        return <p>Checking authentication....</p>
    }

    if (!isAuthenticated){
        return <Navigate to="/login" replace />
    }
   return children;
}
export default ProtectedRoute