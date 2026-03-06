import { toast } from 'react-toastify';

const toaster = (status:number, message:string) => {

  const options = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored" as const,
  };

  const isSuccess = status === 200 || status === 201;;
  const notify = isSuccess ? toast.success : toast.error;
  notify(message, options);
}

export default toaster;