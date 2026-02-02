import React from 'react';
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Tooltip,
  Progress,
} from '@material-tailwind/react';
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  ServerStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/loginContext';

export function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mt-12 px-4">
        <Typography variant="h3" color="blue-gray" className="font-bold">
          Loading...
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 px-4">
      {/* Welcome Header */}
      <div className="mb-8">
        <Typography variant="h3" color="blue-gray" className="font-bold">
          Welcome back, {loading ? 'Loading...' : user?.fullname || 'User'}!
        </Typography>
        <Typography variant="lead" color="gray" className="mt-2">
          Here's an overview of your dashboard. Manage your projects, monitor
          activities, and access key features.
        </Typography>
      </div>

      {/* Quick Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" color="blue-gray">
                  Active Users
                </Typography>
              </div>
              <UserGroupIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" color="blue-gray">
                  UAT Tests
                </Typography>
              </div>
              <ServerStackIcon className="h-8 w-8 text-blue-500" />
            </div>
            <Typography variant="small" color="gray" className="mt-2">
              89% completion rate
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" color="blue-gray">
                  API Sends
                </Typography>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" color="blue-gray">
                  Monitoring
                </Typography>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-orange-500" />
            </div>
            <Typography variant="small" color="gray" className="mt-2">
              All systems operational
            </Typography>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="mb-8">
        <CardHeader floated={false} className="m-0 h-40">
          <div className="flex items-center justify-between p-4">
            <Typography variant="h6" color="blue-gray">
              Recent Activities
            </Typography>
            <Menu>
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>View All</MenuItem>
                <MenuItem>Export</MenuItem>
              </MenuList>
            </Menu>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <UserCircleIcon className="h-8 w-8 text-gray-500" />
              <div className="flex-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-medium"
                >
                  John Doe completed UAT Test #123
                </Typography>
                <Typography variant="small" color="gray">
                  2 hours ago
                </Typography>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-4">
              <UserCircleIcon className="h-8 w-8 text-gray-500" />
              <div className="flex-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-medium"
                >
                  Jane Smith sent API request
                </Typography>
                <Typography variant="small" color="gray">
                  4 hours ago
                </Typography>
              </div>
              <ClockIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <UserCircleIcon className="h-8 w-8 text-gray-500" />
              <div className="flex-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-medium"
                >
                  Mike Johnson updated monitoring
                </Typography>
                <Typography variant="small" color="gray">
                  6 hours ago
                </Typography>
              </div>
              <ArrowUpIcon className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardBody className="p-6 text-center">
            <DocumentDuplicateIcon className="mx-auto mb-4 h-12 w-12 text-blue-500" />
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Landing Templates
            </Typography>
            <Typography variant="small" color="gray">
              Create and manage landing pages
            </Typography>
          </CardBody>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardBody className="p-6 text-center">
            <ServerStackIcon className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <Typography variant="h6" color="blue-gray" className="mb-2">
              UAT Tests
            </Typography>
            <Typography variant="small" color="gray">
              Run and track user acceptance tests
            </Typography>
          </CardBody>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardBody className="p-6 text-center">
            <ChartBarIcon className="mx-auto mb-4 h-12 w-12 text-purple-500" />
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Monitoring
            </Typography>
            <Typography variant="small" color="gray">
              Monitor system performance
            </Typography>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
