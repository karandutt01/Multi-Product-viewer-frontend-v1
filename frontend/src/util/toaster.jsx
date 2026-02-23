import { toast } from 'react-toastify';

const toaster = (status, message) => {
  if(status == 200 || status == 201){
    toast.success(message , {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    })
  }else{
    toast.error(message , {
      position: "top-right",
      autoClose: 5000,
      
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    })
  }
}

export default toaster;