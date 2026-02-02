import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const CustomSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'swal2-confirm-custom',
  },
  buttonsStyling: false,
});

export default CustomSwal;
