import { IconButton, Typography } from '@material-tailwind/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMaterialTailwindController, setOpenSidenav } from '@/context';

export function Topnav() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  return (
    <header className="fixed left-4 top-4 z-[20] xl:hidden">
      <IconButton
        aria-label="Toggle sidenav"
        variant="text"
        size="sm"
        className="bg-black p-2 text-white shadow-md"
        onClick={() => setOpenSidenav(dispatch, true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </IconButton>
    </header>
  );
}

export default Topnav;
