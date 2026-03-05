import React from "react"
import type { ModalCompound } from "types/IModalCompound";
import type { ModalProps } from "types/ModalProps";

function Modal ({children, isOpen=false, onHide}:ModalProps) {
  if(!isOpen) return null;
  return (
    <div className="modal d-block" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-content">
           <button 
            type="button" 
            className="position-absolute top-0 end-0 m-3 cursor-pointer fs-5 px-1" 
            aria-label="Close" 
            onClick={onHide}
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

const ModalCompoundComponent = Modal as ModalCompound;
ModalCompoundComponent.Header = ModalHeader;
ModalCompoundComponent.Body = ModalBody;
ModalCompoundComponent.Footer = ModalFooter;

export default ModalCompoundComponent