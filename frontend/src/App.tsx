import React from 'react';
import logo from './logo.svg';
import './App.css';
import Register from './components/register/Register';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <Register />
      <ToastContainer />
    </>
  );
}

export default App;
