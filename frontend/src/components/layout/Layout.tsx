import React, { useEffect, useState } from 'react'
import './layout.scss';
import SharedOffCanvas from '../shared/SharedOffCanvas';
import { useNavigate } from 'react-router-dom';
import useSessionGuard from 'hooks/useSessionGuard';
import { LOGIN_CONSTANTS } from 'constants/loginConstants';


function Layout({children}: {children: React.ReactNode}) {

  useSessionGuard();
  const navigate = useNavigate();
  const [show, setShow] = useState(false)

  function handleShow(){
    setShow(true)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleShow();
    }
  }

  function handleClose(){
    setShow(false);
  }

  function handleLogout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('activeSession');
    navigate(`${LOGIN_CONSTANTS.ROUTES.LOGIN}`);
  }

  function handleLogoutKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLogout();
    }
  }

   const navigationItems = [
     {
      label: "Dashboard",
      icon: "bi bi-columns-gap",
      route: "/dashboard"
    },
  ]

  return (
   <div className="layout-container">
      <nav className="navbar bg-dark">
        <div className="container-fluid row">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="hamburger d-flex justify-content-center navbar-brand" 
              onClick={handleShow}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Toggle navigation menu"
              aria-expanded={show}
              >
              <i className="bi bi-list text-white"></i>
            </div>

            <div className="navbar-nav">
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center"
                onClick={handleLogout}
                onKeyDown={handleLogoutKeyDown}
                aria-label="Logout from application"
                type="button">
                <i className="bi bi-box-arrow-right me-2"></i>
                <span className="d-none d-md-inline">{LOGIN_CONSTANTS.LABELS.LOGOUT}</span>
              </button>
            </div>
          </div>
        </div>
      </nav> 

      <main className="main-content">
        {children}
      </main>

      <SharedOffCanvas 
        placement="start" 
        name="Menu" 
        show={show} 
        handleClose={handleClose}
        navigationItems={navigationItems} 
      />
    </div>
  )
}

export default Layout