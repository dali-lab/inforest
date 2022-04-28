import { createContext, ReactNode } from "react";

export type ModalContextType = {
  modalComponent: ReactNode;
  setModalComponent: (newModal: ReactNode) => void;
  setOnClose: (newOnClose: () => void) => void;
  openModal: () => void;
  closeModal: () => void;
};

export const defaultModalContext: ModalContextType = {
  modalComponent: null,
  setModalComponent: () => {},
  setOnClose: () => {},
  openModal: () => {},
  closeModal: () => {},
};

const ModalContext = createContext(defaultModalContext);

export default ModalContext;
