import { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Chip } from '@material-tailwind/react';
import { summary } from '@/services/summary';
import { useAuth } from '@/context/loginContext';

export function Home() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRestrictedRole = user?.role_id === 4 || user?.role_id === 5;

  useEffect(() => {
    if (isRestrictedRole) {
      setLoading(false);
      return;
    }

    async function loadSummary() {
      try {
        const res = await summary();
        setData(res);
      } catch (error) {
        console.error('Error loading summary', error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [isRestrictedRole]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Typography>Loading dashboard...</Typography>
      </div>
    );
  }

  if (isRestrictedRole) {
    return <BasicHome user={user} />;
  }

  if (!data) return null;

  return (
    <div className="space-y-8 p-6">
      {/* ===== TITLE ===== */}
      <div className="mb-8 text-black">
        <h1 className="text-2xl font-bold">
          Welcome{user?.fullname ? `, ${user.fullname}` : ''}
        </h1>
        <p className="mt-1 text-sm">Platform status overview in real time.</p>
      </div>

      {/* ===== CONNECTION STATUS ===== */}
      <div className="flex gap-4">
        <StatusCard label="Salesforce" status={data.connections.salesforce} />
        <StatusCard label="SQL Server" status={data.connections.sqlserver} />
      </div>

      {/* ===== METRICS ===== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Users" value={data.users.total} />
        <MetricCard title="Total Agents" value={data.agents.total} />
        <MetricCard
          title="Average Daily Attempts"
          value={data.attemptsDaily.total}
        />
        <MetricCard title="Assigned Cases" value={data.caseAssignments.total} />
        <MetricCard
          title="Infobit Messages"
          value={data.infobitMessages.total}
        />
        <MetricCard
          title="Salesforce Opportunities"
          value={data.salesforceOpportunities.total}
        />
      </div>

      {/* ===== LAST RECORDS ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LastRecord
          title="Last User Created"
          name={data.users.last?.fullname}
          extra={data.users.last?.Role.name}
          date={data.users.last?.created_at}
        />

        <LastRecord
          title="Last Agent Added"
          name={data.agents.last?.fullname}
          extra={data.agents.last?.call_center}
          date={data.agents.last?.created_at}
        />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatusCard({ label, status }) {
  const isConnected = status === 'connected';

  return (
    <Card className="w-48">
      <CardBody className="flex flex-col gap-2">
        <Typography className="text-sm font-medium">{label}</Typography>
        <Chip
          value={isConnected ? 'Connected' : 'Disconnected'}
          color={isConnected ? 'green' : 'red'}
          variant="filled"
          size="sm"
        />
      </CardBody>
    </Card>
  );
}

function MetricCard({ title, value }) {
  return (
    <Card>
      <CardBody>
        <Typography className="text-sm text-gray-600">{title}</Typography>
        <Typography variant="h4" className="font-bold">
          {value}
        </Typography>
      </CardBody>
    </Card>
  );
}

function LastRecord({ title, name, extra, date }) {
  return (
    <Card>
      <CardBody className="space-y-1">
        <Typography className="text-sm text-gray-600">{title}</Typography>
        <Typography className="font-semibold">{name || '-'}</Typography>
        {extra && (
          <Typography className="text-xs text-gray-500">{extra}</Typography>
        )}
        <Typography className="text-xs text-gray-400">
          {date ? new Date(date).toLocaleString() : '-'}
        </Typography>
      </CardBody>
    </Card>
  );
}

function BasicHome({ user }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <img
        src="https://illustrations.popsy.co/gray/work-from-home.svg"
        alt="Welcome"
        className="mb-8 w-72"
      />

      <h1 className="mb-3 text-3xl font-bold">
        Welcome{user?.fullname ? `, ${user.fullname}` : ''} 👋
      </h1>

      <p className="max-w-md text-gray-600">
        We're excited to have you here. Everything is set up and ready — explore
        your workspace and make the most of your experience.
      </p>
    </div>
  );
}
