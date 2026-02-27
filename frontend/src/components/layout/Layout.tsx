import React, { useState } from 'react'
import './layout.scss';
import SharedOffCanvas from '../shared/SharedOffCanvas';


function Layout({children}: {children: React.ReactNode}) {
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

  const navigationItems = [
     {
      label: "Dashboard",
      icon: "bi bi-boxes",
      route: "/dashboard"
    },
    {
      label: "Products",
      icon: "bi bi-boxes",
      route: "/products"
    },
  ]

  return (
   <div className="layout-container">
      <nav className="navbar bg-dark">
        <div className="container-fluid row">
          <div className="col-1">
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