import { ModalProps } from "react-bootstrap";

export interface ModalCompound extends React.FC<ModalProps> {
  Header: React.FC<{ children: React.ReactNode }>;
  Body: React.FC<{ children: React.ReactNode }>;
  Footer: React.FC<{ children: React.ReactNode }>;
};