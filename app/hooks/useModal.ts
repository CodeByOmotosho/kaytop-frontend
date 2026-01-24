import {
  useEffect,
  useRef,
  useState
} from "react";

export function useModal() {

  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function open() {
    modalRef.current?.showModal();
    setIsOpen(true);
  }

  function close() {
    modalRef.current?.close();
    setIsOpen(false);
  }

  useEffect(() => {
    const modalEl = modalRef.current;

    if(!modalEl) return;

    const handleClose  = () => setIsOpen(false);

    modalEl.addEventListener('close', handleClose);

    return () => {
      modalEl.removeEventListener("close", handleClose);
    }
  }, []);


  return {
    modalRef,
    open,
    close,
    isOpen
  }


}