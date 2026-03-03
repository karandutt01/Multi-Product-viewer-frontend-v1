import React from "react"
import { ModalProps } from "types/ModalProps";

function Modal({children, isOpen=false, onClose}:ModalProps) {
  if(!isOpen) return null;

  const handleClose = () => {
    onClose
  };

  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">{children}</div>
        <button 
          type="button" 
          className="btn-close cursor-pointer position-absolute top-0 end-0 m-3" 
          aria-label="Close" 
          onClick={handleClose}
        ></button>
      </div>
    </div>
  )
}

function ModalHeader({ children }: { children: React.ReactNode }) {
  return <div className="modal-header">{children}</div>
}

function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="modal-body">{children}</div>
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="modal-footer">{children}</div>
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal