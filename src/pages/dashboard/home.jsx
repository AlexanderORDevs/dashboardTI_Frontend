import { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, Typography, Chip } from '@material-tailwind/react';
import { summary } from '@/services/summary';
import { useAuth } from '@/context/loginContext';
import { casesAssignments } from '@/services/caseAssignments/getCasesAssignments';
import { getAttemptsxAgent } from '@/services/sqlserver/getAttemptsxAgent';
import AgentCasesCard from '@/components/home/AgentCasesCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function Home() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [attemptsData, setAttemptsData] = useState([]);
  const [selectedCallCenter, setSelectedCallCenter] = useState(null);

  const restrictedRoles = [4, 5, 7];
  const isRestrictedRole = restrictedRoles.includes(user?.role_id);

  useEffect(() => {
    if (isRestrictedRole) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [summaryRes, assignmentsRes, attemptsRes] = await Promise.all([
          summary(),
          casesAssignments(),
          getAttemptsxAgent(),
        ]);

        setData(summaryRes);
        setAssignments(assignmentsRes || []);
        const attempts = attemptsRes?.recordsets?.[0] || [];
        setAttemptsData(attempts);
        const centers = [
          ...new Set(attempts.map((item) => item['Call Center'] || 'Unknown')),
        ];
        setSelectedCallCenter(centers[0] || null);
      } catch (error) {
        console.error('Error loading home data', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isRestrictedRole]);

  const groupedByAgent = useMemo(() => {
    const grouped = {};

    assignments.forEach((item) => {
      const agentName = item.agent?.fullname || 'Unassigned';

      if (!grouped[agentName]) {
        grouped[agentName] = {
          call_center: item.agent?.call_center,
          cases: [],
        };
      }

      grouped[agentName].cases.push(item.case_number);
    });

    return grouped;
  }, [assignments]);

  const attemptsSummary = useMemo(() => {
    if (!attemptsData.length) return null;

    const filteredData = attemptsData.filter(
      (item) => item.HOUR >= 9 && item.HOUR <= 20
    );

    const callCenters = {};
    const hours = Array.from({ length: 12 }, (_, i) => 9 + i);

    filteredData.forEach((item) => {
      const hour = item.HOUR;
      const callCenter = item['Call Center'] || 'Unknown';
      const agent = item['AGENT NAME'] || 'Unassigned';
      const count = item.CallCount || 0;

      if (!callCenters[callCenter]) {
        callCenters[callCenter] = {
          total: 0,
          agents: {},
          hours: {},
          agentsByHour: {},
        };
      }

      callCenters[callCenter].total += count;
      callCenters[callCenter].hours[hour] =
        (callCenters[callCenter].hours[hour] || 0) + count;
      callCenters[callCenter].agents[agent] =
        (callCenters[callCenter].agents[agent] || 0) + count;
      if (!callCenters[callCenter].agentsByHour[agent]) {
        callCenters[callCenter].agentsByHour[agent] = {};
      }
      callCenters[callCenter].agentsByHour[agent][hour] =
        (callCenters[callCenter].agentsByHour[agent][hour] || 0) + count;
    });

    const callCenterNames = Object.keys(callCenters);
    const colors = [
      'rgba(56, 189, 248, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(251, 191, 36, 0.8)',
    ];

    const selectedCenter = selectedCallCenter || callCenterNames[0];
    const centerData = callCenters[selectedCenter];
    const agentNames = centerData ? Object.keys(centerData.agentsByHour) : [];

    const datasets = agentNames.map((agent, index) => ({
      label: agent,
      data: hours.map((hour) => centerData.agentsByHour[agent][hour] || 0),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    return {
      chartData: {
        labels: hours.map((h) => `${h}:00`),
        datasets,
      },
      callCenters,
      callCenterNames,
      selectedCenter,
    };
  }, [attemptsData, selectedCallCenter]);

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
    <div className="space-y-4 p-6">
      <section>
        {/* ===== TITLE ===== */}
        <div className="mb-8 text-black">
          <h1 className="text-2xl font-bold">
            Welcome{user?.fullname ? `, ${user.fullname}` : ''}
          </h1>
        </div>
      </section>

      {/* ===== AGENTS CALL ATTEMPTS CHART ===== */}
      <section className="border-t pt-10">
        <Typography variant="h5" className="mb-4">
          Agents Call Attempts by Hour (9 AM - 8 PM)
        </Typography>
        {attemptsSummary ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:items-start sm:justify-start">
              <Typography className="text-slate-600 text-sm">
                Showing agent distribution:
              </Typography>
              <div className="flex items-center gap-2">
                <Typography className="text-slate-700 text-sm font-medium">
                  Call Center:
                </Typography>
                <select
                  value={
                    selectedCallCenter || attemptsSummary.callCenterNames[0]
                  }
                  onChange={(e) => setSelectedCallCenter(e.target.value)}
                  className="border-slate-300 text-slate-700 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                >
                  {attemptsSummary.callCenterNames.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardBody>
                    <Bar
                      data={attemptsSummary.chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              boxWidth: 12,
                              usePointStyle: true,
                            },
                          },
                          title: {
                            display: true,
                            text: `Agent attempts per hour - ${
                              selectedCallCenter ||
                              attemptsSummary.callCenterNames[0]
                            }`,
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                          },
                        },
                        interaction: {
                          mode: 'index',
                          intersect: false,
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Hour',
                            },
                            stacked: false,
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Call Count',
                            },
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </CardBody>
                </Card>

                <div className="space-y-4">
                  <Typography className="text-slate-800 font-semibold">
                    Agent Calls per Hour
                  </Typography>

                  {attemptsSummary &&
                    Object.entries(
                      attemptsSummary.callCenters[
                        selectedCallCenter || attemptsSummary.callCenterNames[0]
                      ]?.agentsByHour || {}
                    ).map(([agent, hoursData]) => (
                      <Card
                        key={agent}
                        className="border-slate-200 border bg-white"
                      >
                        <CardBody>
                          <Typography className="text-slate-800 mb-2 text-sm font-semibold">
                            {agent}
                          </Typography>

                          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                            {Array.from({ length: 12 }, (_, i) => 9 + i).map(
                              (hour) => (
                                <div
                                  key={hour}
                                  className="bg-slate-50 rounded-lg border p-2 text-center"
                                >
                                  <div className="text-slate-500 text-xs">
                                    {hour}:00
                                  </div>
                                  <div className="text-slate-800 text-sm font-semibold">
                                    {hoursData[hour] || 0}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </div>

              <div className="order-1 space-y-4 lg:order-2">
                {(() => {
                  const selected =
                    selectedCallCenter || attemptsSummary.callCenterNames[0];

                  const summary = attemptsSummary.callCenters[selected];

                  if (!summary) return null;

                  return (
                    <Card key={selected} className="bg-slate-950 text-black">
                      <CardBody>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <Typography className="text-sm font-semibold text-black">
                              {selected}
                            </Typography>
                            <Typography className="text-slate-400 text-xs">
                              Total calls: {summary.total}
                            </Typography>
                          </div>
                          <div className="bg-slate-800 rounded-full px-3 py-1 text-xs">
                            {Object.keys(summary.agents).length} agents
                          </div>
                        </div>

                        <div className="space-y-2">
                          {Object.entries(summary.agents)
                            .sort((a, b) => b[1] - a[1])
                            .map(([agent, count]) => (
                              <div
                                key={agent}
                                className="bg-slate-900 flex items-center justify-between rounded-xl px-3 py-2"
                              >
                                <div className="text-slate-100 text-sm">
                                  {agent}
                                </div>
                                <div className="text-emerald-300 text-sm font-semibold">
                                  {count}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <Typography>No data available for the chart.</Typography>
        )}
      </section>

      {/* ===== ASSIGNED CASES BY AGENT ===== */}
      <section className="border-t">
        <div className="mt-10">
          <Typography variant="h5" className="mb-4">
            Cases Assigned Per Agent
          </Typography>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Object.entries(groupedByAgent).map(([agentName, data]) => (
              <AgentCasesCard
                key={agentName}
                agentName={agentName}
                callCenter={data.call_center}
                cases={data.cases}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="border-t pt-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Total Users" value={data.users.total} />
          <MetricCard title="Total Agents" value={data.agents.total} />
          <MetricCard
            title="Average Daily Attempts"
            value={data.attemptsDaily.total}
          />
          <MetricCard
            title="Assigned Cases"
            value={data.caseAssignments.total}
          />
          <MetricCard
            title="Infobit Messages"
            value={data.infobitMessages.total}
          />
          <MetricCard
            title="Salesforce Opportunities"
            value={data.salesforceOpportunities.total}
          />
        </div>
      </section>
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
