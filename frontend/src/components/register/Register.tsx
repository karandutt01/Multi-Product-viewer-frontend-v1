import { registerUser } from '../../service/authService';
import toaster from "../../util/toaster";
import type { IRegisterForm } from '../../types/IRegisterForm';
import type { AxiosResponse } from 'axios';
import './register.scss';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { REGISTER_CONSTANTS, REGISTER_FORM_FIELDS } from '../../constants/registerConstants';
import { parsedError } from 'util/errorHandler';
import LoadingButton from 'components/shared/LoadingButton';
import ApiError from 'components/shared/ApiError';


function Register() {

      
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const {register, formState:{errors, isSubmitting}, handleSubmit, setError, reset} = useForm<IRegisterForm>();

  const onFormSubmit = async(formData:IRegisterForm) => {

    try {
      const response: AxiosResponse = await registerUser(formData);
      if (response.status === 200 || response.status === 201) {
        toaster(response.status, response.data.message || REGISTER_CONSTANTS.SUCCESS.REGISTRATION_DEFAULT)
        reset();
        navigate('/login');
      }

    } catch (error: unknown) {

      setApiError(undefined);
      const parsed = parsedError(error);

      // CHANGE: Handle field-specific errors from server
      if (parsed?.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof IRegisterForm, {
            type: 'server',
            message,
          });
        });
      }

      // Global error
      if (parsed && parsed.message) {
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
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="card p-3 dark-card">
              <h1 className="card-title fw-bold text-center fs-4">{REGISTER_CONSTANTS.LABELS.TITLE}</h1>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor={REGISTER_FORM_FIELDS.firstname.id} className="form-label">{REGISTER_FORM_FIELDS.firstname.label}</label>
                  <input 
                  placeholder={REGISTER_FORM_FIELDS.firstname.placeholder}
                  className="form-control" 
                  id={REGISTER_FORM_FIELDS.firstname.id} 
                  disabled={isSubmitting}
                  {
                    ...register('firstname', REGISTER_FORM_FIELDS.firstname.validation)
                  }/>
                  {errors.firstname && <div className='text-danger'>{errors.firstname.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor={REGISTER_FORM_FIELDS.lastname.id} className="form-label">{REGISTER_FORM_FIELDS.lastname.label}</label>
                  <input 
                  placeholder={REGISTER_FORM_FIELDS.lastname.placeholder}
                  className="form-control" 
                  id={REGISTER_FORM_FIELDS.lastname.id} 
                  disabled={isSubmitting}
                  {
                    ...register('lastname', REGISTER_FORM_FIELDS.lastname.validation)
                  }/>
                  {errors.lastname && <div className='text-danger'>{errors.lastname.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor={REGISTER_FORM_FIELDS.email.id} className="form-label">{REGISTER_FORM_FIELDS.email.label}</label>
                  <input 
                    placeholder={REGISTER_FORM_FIELDS.email.placeholder}
                    className="form-control" 
                    id={REGISTER_FORM_FIELDS.email.id} 
                    disabled={isSubmitting}
                    {
                      ...register('email', REGISTER_FORM_FIELDS.email.validation)
                    }/>

                    {errors.email && <div className='text-danger'>{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor={REGISTER_FORM_FIELDS.password.id} className="form-label"> {REGISTER_FORM_FIELDS.password.label}</label>
                  <input 
                    type='password'
                    placeholder={REGISTER_FORM_FIELDS.password.placeholder}
                    className="form-control" 
                    id={REGISTER_FORM_FIELDS.password.id} 
                    disabled={isSubmitting}
                    {
                      ...register('password', REGISTER_FORM_FIELDS.password.validation)
                    }/>

                    {errors.password && <div className='text-danger'>{errors.password.message}</div>}
                </div>
                  
                <div className='mb-3'>Already have a account? <Link to='/login' className='text-primary'>Login</Link></div>
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="btn btn-dark w-100 registerButton"
                >
                  {REGISTER_CONSTANTS.LABELS.SUBMIT_BUTTON}
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register