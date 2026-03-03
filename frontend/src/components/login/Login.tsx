import { useForm } from 'react-hook-form';
import type { ILogin } from '../../types/ILogin';
import { AxiosError } from 'axios';
import { loginUser } from '../../service/authService';
import { useAuth } from '../../hooks/useAuth';
import toaster from '../../util/toaster';
import { useLocation, useNavigate } from 'react-router-dom';
import { LOGIN_CONSTANTS, LOGIN_FORM_FIELDS } from '../../constants/loginConstants';
import LoadingButton from 'components/shared/LoadingButton';
import ApiError from 'components/shared/ApiError';
import { useState } from 'react';
import { parsedError } from 'util/errorHandler';


function Login() {  

  const {setAuth} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, formState:{errors, isSubmitting}, handleSubmit, setError } = useForm<ILogin>();
  const [apiError, setApiError] = useState<string | undefined>(undefined);


  const onLogin = async(formData:ILogin) => {
    try {
      const response = await loginUser(formData)
      if (response && response.data) {
        toaster(response.status, response?.data?.message || LOGIN_CONSTANTS.SUCCESS.LOGIN_DEFAULT)
        setAuth(response.data);
        navigate(LOGIN_CONSTANTS.ROUTES.DASHBOARD);
      }

    } catch (error: unknown) {
      setApiError(undefined);
      const parsed = parsedError(error)
      if(parsed && parsed.message){
        setApiError(parsed.message);
      }
    }
  }

  return (
    <div className='container-fluid min-vh-100 d-flex justify-content-center align-items-center'>
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div>
          <div className='mb-3'>
            <ApiError message={apiError}/>
          </div>
          <form onSubmit={handleSubmit(onLogin)}>
            <div className="card p-3 dark-card">
              <h1 className="card-title fw-bold text-center fs-4">{LOGIN_CONSTANTS.LABELS.TITLE}</h1>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor={LOGIN_FORM_FIELDS.email.id} className="form-label">{LOGIN_FORM_FIELDS.email.label}</label>
                  <input 
                  placeholder={LOGIN_FORM_FIELDS.email.placeholder}
                  className="form-control" 
                  id={LOGIN_FORM_FIELDS.email.id} 
                  {
                    ...register('email', LOGIN_FORM_FIELDS.email.validation)
                  }/>
                  {errors.email && <div className='text-danger'>{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor={LOGIN_FORM_FIELDS.password.id} className="form-label">{LOGIN_FORM_FIELDS.password.label}</label>
                  <input 
                  type='password'
                  placeholder={LOGIN_FORM_FIELDS.password.placeholder}
                  className="form-control" 
                  id={LOGIN_FORM_FIELDS.password.id} 
                  {
                    ...register('password', LOGIN_FORM_FIELDS.password.validation)
                  }/>
                  {errors.password && <div className='text-danger'>{errors.password.message}</div>}
                </div>

                <div>
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    className="btn btn-dark w-100 registerButton"
                    >
                    {LOGIN_CONSTANTS.LABELS.SUBMIT_BUTTON}
                  </LoadingButton>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Login
