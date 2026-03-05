import Offcanvas from 'react-bootstrap/Offcanvas';
import { useNavigate } from 'react-router-dom';
import type { INavigationItem } from 'types/INavigationItems';

function SharedOffCanvas({placement, name, show, handleClose, navigationItems}:{
  placement: 'start' | 'end' | 'top' | 'bottom',
  name: string, 
  show:boolean,
  handleClose: () => void,
  navigationItems: INavigationItem[]
}) {

  const navigate = useNavigate()

  const handleNavigation = (route:string) => {
    navigate(route);
    handleClose();
  }

  return (
    <Offcanvas show={show} placement={placement} onClose={handleClose}>
        <Offcanvas.Header>
          <Offcanvas.Title>{name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {
            navigationItems?.map((items, index) => (
              <button
                key={index}
                className='w-100 text-start btn btn-outline-secondary mb-3'
                onClick={() => handleNavigation(items.route)}
              >
              {items.icon && <i className={`${items.icon} mx-2`}></i>}
              {items.label}
              </button>
            ))
          }
        </Offcanvas.Body>
    </Offcanvas>
  )
}


export default SharedOffCanvas