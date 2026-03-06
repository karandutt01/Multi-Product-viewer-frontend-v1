import React from 'react'
import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({children}: {children: React.ReactNode}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if(!isAuthenticated()){
    return <Navigate to='/login' state={{from: location}} replace />
  }

  return (
    <>{children}</>
  )
}

export default ProtectedRoute