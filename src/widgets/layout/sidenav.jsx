import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
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
      {/* OVERLAY MOBILE */}
      {openSidenav && (
        <div
          className="fixed inset-0 z-40 bg-black/40 xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        />
      )}

      {/* SIDENAV */}
      <aside
        className={` fixed left-0
          top-0 z-50 h-screen w-20
          bg-black
          transition-transform duration-300
          ${openSidenav ? 'translate-x-0' : '-translate-x-full'}
          xl:sticky xl:translate-x-0
        `}
      >
        <div className="flex h-full flex-col justify-between py-4">
          {/* ===== MENU ===== */}
          <ul className="flex flex-col items-center gap-2">
            {routes.map(({ layout, pages }) =>
              pages
                .filter((page) => !page.hidden)
                .map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <div className="group relative">
                          <Button
                            variant="text"
                            className={`
                              flex h-14 w-14 items-center justify-center
                              rounded-xl transition-all duration-200
                              ${
                                isActive
                                  ? 'bg-[#EEA11E] text-white shadow-lg'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }
                            `}
                          >
                            <div className="text-2xl">{icon}</div>
                          </Button>

                          {/* TOOLTIP */}
                          <div
                            className="
                              pointer-events-none absolute left-16 top-1/2 z-50
                              -translate-y-1/2 whitespace-nowrap
                              rounded-md bg-black px-3 py-1.5
                              text-xs font-medium text-white
                              opacity-0 shadow-lg
                              transition-all duration-200
                              group-hover:translate-x-1 group-hover:opacity-100
                            "
                          >
                            {name}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))
            )}
          </ul>

          {/* ===== USER / LOGOUT ===== */}
          <div className="flex flex-col items-center gap-4 pb-4">
            {/* AVATAR */}
            <div className="group relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="h-12 w-10 rounded-full"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-gray-300" />
              )}

              {/* TOOLTIP USER */}
              <div
                className="
                  pointer-events-none absolute left-16 top-1/2
                  -translate-y-1/2 rounded-md bg-black px-3 py-1
                  text-xs text-white opacity-0
                  transition group-hover:opacity-100
                "
              >
                {user?.fullname || 'User'}
              </div>
            </div>

            {/* LOGOUT */}
            <div className="group relative">
              <ArrowLeftOnRectangleIcon
                onClick={handleLogout}
                className="h-6 w-6 cursor-pointer text-red-400 hover:text-red-300"
              />

              <div
                className="
                  pointer-events-none absolute left-16 top-1/2
                  -translate-y-1/2 rounded bg-black px-2 py-1
                  text-xs text-white opacity-0
                  transition group-hover:opacity-100
                "
              >
                Logout
              </div>
            </div>
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
