import { toast, Zoom } from 'react-toastify';


const Success = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
    });
}

export default Success;