import { useForm } from 'react-hook-form';
import type { ILogin } from '../../types/ILogin';
import { AxiosError } from 'axios';
import { loginUser } from '../../service/authService';
import { useAuth } from '../../hooks/useAuth';
import toaster from '../../util/toaster';
import { useLocation, useNavigate } from 'react-router-dom';



function Login() {  

  const {setAuth} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, formState:{errors}, handleSubmit, setError } = useForm<ILogin>();



  const onLogin = async(formData:ILogin) => {
    try {
      const response = await loginUser(formData)
      if (response && response.data) {
        toaster(response.status, response?.data?.message || "Login successful")
        setAuth(response.data);
        navigate('/dashboard');
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : error instanceof AxiosError 
          ? error.message 
          : 'An unexpected error occurred';

      setError('root', {
        message: errorMessage
      })
    }
  }

  return (
    <div className='container-fluid min-vh-100 d-flex justify-content-center align-items-center'>
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div>
          <form onSubmit={handleSubmit(onLogin)}>
            <div className="card p-3 dark-card">
              <h1 className="card-title fw-bold text-center fs-4">Sign in with email</h1>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="loginFormEmail" className="form-label">Email</label>
                  <input 
                  placeholder='Enter the email' 
                  className="form-control" 
                  id="loginFormEmail" 
                  {
                    ...register('email', {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address"
                      }
                    })
                  }/>
                  {errors.email && <div className='text-danger'>{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="loginFormPassword" className="form-label">Password</label>
                  <input 
                  placeholder='Enter the password' 
                  className="form-control" 
                  id="loginFormPassword" 
                  {
                    ...register('password', {
                      required: "Password is required",
                      minLength: { 
                        value: 8,
                        message: "Password must be at least 8 characters long"
                      }
                    })
                  }/>
                  {errors.password && <div className='text-danger'>{errors.password.message}</div>}
                </div>

                <div>
                  <button type="submit" className="btn btn-dark w-100 registerButton">Sign In</button>
                </div>
              </div>
            </div>
          </form>

          <div>{ errors.root && <div className='text-danger'>{errors.root.message}</div>}</div>
        </div>
      </div>
    </div>
  )
}

export default Login
