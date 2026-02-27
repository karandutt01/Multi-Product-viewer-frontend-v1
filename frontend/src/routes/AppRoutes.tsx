import { createBrowserRouter } from 'react-router-dom';
import Register from '../components/register/Register';
import Login from '../components/login/Login';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../components/dashboard/Dashboard';
import Products from 'components/products/Products';
import Layout from 'components/layout/Layout';

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
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path:'/products',
    element: (
      <ProtectedRoute>
        <Layout>
          <Products />
        </Layout>
      </ProtectedRoute>
    )
  }
])

export default router;