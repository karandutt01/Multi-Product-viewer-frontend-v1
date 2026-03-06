import './App.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/authContext';
import { RouterProvider } from 'react-router-dom';
import router from './routes/AppRoutes';

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AuthProvider>
    </>
  );
}

export default App;
