import React from 'react';
import './App.css';
import Register from './components/register/Register';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/authContext';
import { RouterProvider } from 'react-router-dom';
import router from './routes/AppRoutes';

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router}>
            <ToastContainer />
        </RouterProvider>
      </AuthProvider>
    </>
  );
}

export default App;
