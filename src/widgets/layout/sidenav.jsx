import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftOnRectangleIcon,
  BellAlertIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '@/context/loginContext';
import { useMaterialTailwindController, setOpenSidenav } from '@/context';
import CustomSwal from '@/utils/customSwal';
import { getInboundNotifications } from '@/services/infobit/getInboundNotifications';

const ALLOWED_NOTIFICATION_ROLES = new Set([1, 2, 3, 4]);
const NOTIFICATIONS_POLLING_MS = 15 * 1000;

const getNotificationId = (item) =>
  item?.id ?? item?.inboundId ?? item?.notificationId ?? item?.messageId ?? 0;

const normalizeInboundRows = (response) => {
  if (Array.isArray(response)) return response;

  return (
    response?.notifications ||
    response?.items ||
    response?.rows ||
    response?.data ||
    response?.results ||
    []
  );
};

const getNextLastId = (response, rows, currentLastId) => {
  const responseLastId =
    response?.lastId ?? response?.maxId ?? response?.last_id;
  if (responseLastId !== undefined && responseLastId !== null) {
    return Number(responseLastId) || currentLastId;
  }

  const maxRowId = rows.reduce((max, row) => {
    const id = Number(getNotificationId(row));
    return Number.isFinite(id) ? Math.max(max, id) : max;
  }, currentLastId);

  return maxRowId;
};

export function Sidenav({ routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [inboundCount, setInboundCount] = useState(0);
  const isInitializedRef = useRef(false);
  const sinceIdRef = useRef(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/auth/sign-in', { replace: true });
  };

  const handleOpenInfobit = () => {
    setInboundCount(0);
    navigate('/dashboard/infobit');
  };

  useEffect(() => {
    if (!ALLOWED_NOTIFICATION_ROLES.has(Number(user?.role_id))) {
      setInboundCount(0);
      isInitializedRef.current = false;
      sinceIdRef.current = 0;
      return;
    }

    const storageKey = `infobit_inbound_last_id_${user?.id || 'guest'}`;
    const savedLastId = Number(localStorage.getItem(storageKey) || 0);
    sinceIdRef.current = savedLastId;

    const pollInboundNotifications = async () => {
      try {
        const response = await getInboundNotifications(sinceIdRef.current, 100);
        const rows = normalizeInboundRows(response);
        const count = Number(response?.count) || rows.length;
        const nextLastId = getNextLastId(response, rows, sinceIdRef.current);

        sinceIdRef.current = nextLastId;
        localStorage.setItem(storageKey, String(nextLastId));

        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          return;
        }

        if (count > 0) {
          setInboundCount((prev) => prev + count);

          const firstInbound = rows[0] || {};
          const phone =
            firstInbound?.numberPhone || firstInbound?.numberphone || 'Unknown';

          CustomSwal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'New inbound reply',
            text: `${count} new reply${count > 1 ? 'ies' : ''}. Latest from ${phone}.`,
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error('Error polling inbound notifications:', error);
      }
    };

    pollInboundNotifications();
    const intervalId = setInterval(
      pollInboundNotifications,
      NOTIFICATIONS_POLLING_MS
    );

    return () => clearInterval(intervalId);
  }, [user?.id, user?.role_id]);

  return (
    <>
      {/* OVERLAY MOBILE */}
      {openSidenav && (
        <button
          type="button"
          aria-label="Close side menu"
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
            {ALLOWED_NOTIFICATION_ROLES.has(Number(user?.role_id)) &&
              inboundCount > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    aria-label="Open Infobit notifications"
                    onClick={handleOpenInfobit}
                    className="relative rounded-md p-1 text-gray-300 transition hover:bg-gray-800 hover:text-white"
                  >
                    <BellAlertIcon className="h-7 w-7" />
                    <span className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white">
                      {inboundCount > 99 ? '99+' : inboundCount}
                    </span>
                  </button>

                  <div
                    className="
                  pointer-events-none absolute left-16 top-1/2
                  -translate-y-1/2 rounded bg-black px-2 py-1
                  text-xs text-white opacity-0
                  transition group-hover:opacity-100
                "
                  >
                    {`${inboundCount} new inbound replies`}
                  </div>
                </div>
              )}

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
