import { Routes, Route } from 'react-router-dom';
import { Sidenav, Footer, Topnav } from '@/widgets/layout';
import { getRoutes } from '@/routes';
import { useMaterialTailwindController } from '@/context';
import { useAuth } from '@/context/loginContext';

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;
  const sidenavColor = 'from-orange-400 to-orange-600';
  const { user } = useAuth();

  const routes = getRoutes(user);

  return (
    <div className="flex min-h-screen">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === 'dark' ? '/img/logo-ct.png' : '/img/logo-ct-dark.png'
        }
        sidenavColor={sidenavColor}
      />

      <div className="flex flex-1 flex-col p-4  ">
        <div className="relative flex items-center justify-between ">
          <Topnav />
        </div>

        <div className="flex-1 overflow-y-auto">
          <Routes>
            {routes.map(
              ({ layout, pages }) =>
                layout === 'dashboard' &&
                pages.map(({ path, element }) => (
                  <Route exact path={path} element={element} />
                ))
            )}
          </Routes>
        </div>

        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = '/src/layout/dashboard.jsx';

export default Dashboard;
