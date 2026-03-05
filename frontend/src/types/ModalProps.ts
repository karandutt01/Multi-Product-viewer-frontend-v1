export interface ModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onHide?: () => void;
}