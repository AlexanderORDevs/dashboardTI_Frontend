import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@material-tailwind/react';
import { ArrowLeftOnRectangleIcon, UserIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/loginContext';
import { useMaterialTailwindController, setOpenSidenav } from '@/context';

export function Sidenav({ routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/auth/sign-in', { replace: true });
  };

  return (
    <>
      {openSidenav && (
        <div
          className="fixed inset-0 z-40 bg-black/40 xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        />
      )}
      {/* bg-gradient-to-br from-gray-800 to-gray-900 */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-[6.5rem] min-w-[6.5rem]
          bg-gradient-to-br from-black to-black
          transition-transform duration-300
          ${openSidenav ? 'translate-x-0' : '-translate-x-full'}
          xl:sticky xl:translate-x-0
        `}
      >
        <div className="flex h-full flex-col justify-between py-4">
          {/* 🔹 MAIN */}
          <ul className="flex flex-col items-center gap-2">
            {routes.map(({ layout, pages }) =>
              pages
                .filter((page) => !page.hidden)
                .map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? 'gradient' : 'text'}
                          color={isActive ? 'orange' : 'blue-gray'}
                          className="flex flex-col items-center gap-1 px-2 py-3"
                          fullWidth
                        >
                          <div className=" text-xl">{icon}</div>
                          <Typography
                            variant="small"
                            className={`text-[10px] ${
                              isActive ? 'text-white' : 'text-gray-300'
                            }`}
                          >
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                ))
            )}
          </ul>

          {/* USER INFO AND LOGOUT */}
          <div className="flex flex-col items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <UserIcon className="h-8 w-8 text-gray-300" />
            )}
            <div className="truncate text-center text-xs text-white">
              {user?.fullname || 'Usuario'}
            </div>
            <ArrowLeftOnRectangleIcon
              onClick={handleLogout}
              className="h-6 w-6 cursor-pointer text-red-400 hover:text-red-300"
            />
          </div>
        </div>
      </aside>
    </>
  );
}

Sidenav.propTypes = {
  routes: PropTypes.array.isRequired,
};

export default Sidenav;
