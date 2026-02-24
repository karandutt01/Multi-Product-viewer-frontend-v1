import React, { useState } from 'react'
import { registerUser } from '../service/authService';
import toaster from "../util/toaster";
import { IRegisterForm } from '../types/IRegisterForm';
import { AxiosError, AxiosResponse } from 'axios';
import './register.scss';
import { useForm } from 'react-hook-form';

function Register() {

  const {register, formState:{errors}, handleSubmit, setError} = useForm<IRegisterForm>();



  const onFormSubmit = async(formData:IRegisterForm) => {

    try {
      const response: AxiosResponse = await registerUser(formData);
      if (response.status == 200 || response.status == 201) {
        toaster(response.status, response.data.message || "Registration successful")
      }

    } catch (error: AxiosError | any) {

      if (error.response?.data && Array.isArray(error.response?.data.details)) {
        // const errors: any = {};
        // error.response.data.details.forEach((err: any) => {
        //   if (!errors[err.field]) {
        //     errors[err.field] = [];
        //   }
        //   errors[err.field].push(err.message);
        // })
        setError('root', {
          message:error.message
        });
      }
    }
  }


  return (
    <div className='container-fluid min-vh-100 d-flex justify-content-center align-items-center'>
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="card p-3 dark-card">
              <h1 className="card-title fw-bold text-center fs-4">Create an account</h1>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="registerFormFirstname" className="form-label">Firstname</label>
                  <input 
                  placeholder='Enter the firstname' 
                  className="form-control" 
                  id="registerFormFirstname" 
                  {
                    ...register('firstname', {
                      required: "Firstname is required",
                    })
                  }/>
                  {errors.firstname && <div className='text-danger'>{errors.firstname.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="registerFormLastname" className="form-label">Lastname</label>
                  <input 
                  placeholder='Enter the lastname' 
                  className="form-control" 
                  id="registerFormLastname" 
                  {
                    ...register('lastname', {
                      required: "Lastname is required",
                    })
                  }/>
                  {errors.lastname && <div className='text-danger'>{errors.lastname.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="registerFormemail" className="form-label">Email</label>
                  <input 
                    placeholder='Enter the email' 
                    className="form-control" 
                    id="registerFormemail" 
                    {
                      ...register('email', {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address"
                        }
                      })
                    }/>

                    {errors.email && <div className='text-danger'>{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="registerFormPassword" className="form-label">Password</label>
                  <input 
                    placeholder='Enter the password' 
                    className="form-control" 
                    id="registerFormPassword" 
                    {
                      ...register('password', {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters long"
                        }
                      })
                    }/>

                    {errors.password && <div className='text-danger'>{errors.password.message}</div>}
                </div>

                <button type="submit" className="btn btn-dark w-100 registerButton">Register</button>
              </div>
              <div>{errors.root && <div className='text-danger'>{errors.root.message}</div>}</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register