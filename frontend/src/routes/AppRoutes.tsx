import { createBrowserRouter } from 'react-router';
import Register from '../components/register/Register';
import Login from '../components/login/Login';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../components/dashboard/Dashboard';

const router = createBrowserRouter([
  {
    path:'/',
    Component:Register
  },
  {
    path:'/login',
    Component:Login
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