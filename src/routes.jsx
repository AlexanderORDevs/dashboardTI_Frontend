import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  SignalIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid';
import {
  Home,
  LandingTemplates,
  CreateRegister,
  Users,
  Monitoring,
  ApiSends,
  Infobit,
} from '@/pages/dashboard';
import { SignIn } from '@/pages/auth';

const icon = {
  className: 'w-5 h-5 text-inherit',
};

const allRoutes = [
  {
    layout: 'dashboard',
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: 'dashboard',
        path: '/home',
        element: <Home />,
      },
      // Landing Manager
      {
        icon: <DocumentDuplicateIcon {...icon} />,
        name: 'Landing Template',
        path: '/landingTemplate',
        element: <LandingTemplates />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: 'Uat Test',
        path: '/uatRecords',
        element: <CreateRegister />,
      },
      {
        icon: <Squares2X2Icon {...icon} />,
        name: 'Infobit',
        path: '/infobit',
        element: <Infobit />,
      },
      {
        icon: <SignalIcon {...icon} />,
        name: 'Api Send',
        path: '/apiSend',
        element: <ApiSends />,
      },
      {
        icon: <ChartBarIcon {...icon} />,
        name: 'Monitoring',
        path: '/monitoring',
        element: <Monitoring />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: 'Users',
        path: '/users',
        element: <Users />,
      },
    ],
  },
  {
    title: 'auth pages',
    layout: 'auth',
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: 'sign in',
        path: '/sign-in',
        element: <SignIn />,
        hidden: true,
      },
    ],
  },
];

export const getRoutes = (user) => {
  return allRoutes.map((route) => ({
    ...route,
    pages: route.pages.filter((page) => {
      if (user?.role_id === 3 || user?.role_id === 4) {
        return (
          page.name === 'Monitoring' ||
          page.name === 'Api Send' ||
          page.name === 'dashboard' ||
          page.name === 'Infobit'
        );
      } else if (user?.role_id === 5) {
        return page.name === 'Monitoring' || page.name === 'dashboard';
      }
      return true;
    }),
  }));
};

export default allRoutes;
