import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Register from '../components/register/Register';
import Login from '../components/login/Login';

let router = createBrowserRouter([
  {
    path:'/',
    Component:Register
  },
  {
    path:'/login',
    Component:Login
  }
])

export default router;