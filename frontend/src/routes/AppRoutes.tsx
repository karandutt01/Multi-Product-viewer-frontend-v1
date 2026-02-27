import { createBrowserRouter } from 'react-router-dom';
import Register from '../components/register/Register';
import Login from '../components/login/Login';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../components/dashboard/Dashboard';

const router = createBrowserRouter([
  {
    path:'/',
    element:<Register />
  },
  {
    path:'/login',
    element:<Login />
  },
  {
    path:'/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  }
])

export default router;