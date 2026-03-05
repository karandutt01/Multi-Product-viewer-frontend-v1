import React from "react"
import type { ModalProps } from "types/ModalProps";

function Modal({children, isOpen=false, onClose}:ModalProps) {
  if(!isOpen) return null;

  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
           <button 
            type="button" 
            className="position-absolute top-0 end-0 m-3 cursor-pointer fs-5 px-1" 
            aria-label="Close" 
            onClick={onClose}
          >
          X
          </button>
          {children}
        </div>
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