import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Spinner,
} from '@material-tailwind/react';
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
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [chartView, setChartView] = useState('agent');
  const [supplierTopLimit, setSupplierTopLimit] = useState(5);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [caseNumberSearch, setCaseNumberSearch] = useState('');
  const [activeSuppliers, setActiveSuppliers] = useState(new Set());
  const [prevTopLimit, setPrevTopLimit] = useState(0);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const restrictedRoles = [4, 5, 7, 8, 9];
  const isRestrictedRole = restrictedRoles.includes(user?.role_id);

  useEffect(() => {
    if (isRestrictedRole) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoadingAttempts(true);
        const [summaryRes, assignmentsRes, attemptsRes] = await Promise.all([
          summary(),
          casesAssignments(),
          getAttemptsxAgent(selectedDate),
        ]);
        setData(summaryRes);
        setAssignments(assignmentsRes || []);
        const attempts = attemptsRes?.data || attemptsRes || [];
        setAttemptsData(attempts);
        const centers = [
          ...new Set(
            attempts.map(
              (item) =>
                item['CALL CENTER'] ||
                item['Call Center'] ||
                item['Call Center'] ||
                'Unknown'
            )
          ),
        ];
        setSelectedCallCenter(centers[0] || null);
      } catch (error) {
        console.error('Error loading home data', error);
      } finally {
        setLoading(false);
        setIsLoadingAttempts(false);
      }
    }

    loadData();
  }, [isRestrictedRole, selectedDate]);

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Step 1: Generate Excel and get the file URL
      const generateResponse = await fetch(
        `${apiUrl}/sqlserver/generate-excel?date=${selectedDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!generateResponse.ok) {
        const errorBody = await generateResponse.text();
        console.error('Generation failed:', errorBody);
        throw new Error(
          `Failed to generate Excel: ${generateResponse.status} - ${errorBody}`
        );
      }

      // Read and parse response
      const generateBody = await generateResponse.text();

      let generateData;
      try {
        generateData = JSON.parse(generateBody);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Body:', generateBody);
        throw new Error('Invalid JSON response from server');
      }

      const { excelFile } = generateData;

      if (!excelFile || !excelFile.fileUrl || !excelFile.fileName) {
        console.error('Missing excelFile data:', excelFile);
        throw new Error(
          'Server did not return excelFile with fileUrl and fileName'
        );
      }

      // Step 2: Download the Excel file using the fileUrl
      const downloadResponse = await fetch(`${apiUrl}${excelFile.fileUrl}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!downloadResponse.ok) {
        const errorBody = await downloadResponse.text();
        console.error('Download failed:', errorBody);
        throw new Error(
          `Failed to download file: ${downloadResponse.status} - ${errorBody}`
        );
      }

      // Get blob and validate it's not empty
      const blob = await downloadResponse.blob();

      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Step 3: Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const formattedDate = selectedDate;
      link.download = `agents_attempts_${formattedDate}.xlsx`;
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Error downloading Excel:', error);
      alert(`Error downloading Excel file: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

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

  const typeOptions = useMemo(() => {
    const values = attemptsData
      .map((item) => item['TYPE'] || item['Type'] || item.type || null)
      .filter(Boolean);
    return [...new Set(values)].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [attemptsData]);

  const supplierOptions = useMemo(() => {
    const values = attemptsData
      .map(
        (item) => item['SUPPLIER'] || item['Supplier'] || item.supplier || null
      )
      .filter(Boolean);
    return [...new Set(values)].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [attemptsData]);

  const supplierSuggestions = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();
    const filtered = query
      ? supplierOptions.filter((name) =>
          String(name).toLowerCase().includes(query)
        )
      : supplierOptions;
    return filtered.slice(0, 50);
  }, [supplierOptions, supplierSearch]);

  useEffect(() => {
    if (typeSearch && !typeOptions.includes(typeSearch)) {
      setTypeSearch('');
    }
  }, [typeOptions, typeSearch]);

  const attemptsSummary = useMemo(() => {
    if (!attemptsData.length) return null;

    const normalizedSupplier = supplierSearch.trim().toLowerCase();
    const normalizedType = typeSearch.trim().toLowerCase();
    const normalizedPhone = phoneSearch.trim().toLowerCase();
    const normalizedCaseNumber = caseNumberSearch.trim().toLowerCase();

    const filteredData = attemptsData.filter((item) => {
      if (item.HOUR === undefined || item.HOUR === null) return false;

      const supplierValue = String(
        item['SUPPLIER'] || item['Supplier'] || item.supplier || ''
      ).toLowerCase();
      const typeValue = String(
        item['TYPE'] || item['Type'] || item.type || ''
      ).toLowerCase();
      const phoneValue = String(
        item['PHONE NUMBER'] || item['Phone Number'] || item.phone || ''
      ).toLowerCase();
      const caseNumberValue = String(
        item['CASE_NUMBER'] || item['Case_Number'] || item.caseNumber || ''
      ).toLowerCase();

      const matchesSupplier =
        !normalizedSupplier || supplierValue.includes(normalizedSupplier);
      const matchesType = !normalizedType || typeValue === normalizedType;
      const matchesPhone =
        !normalizedPhone || phoneValue.includes(normalizedPhone);
      const matchesCaseNumber =
        !normalizedCaseNumber || caseNumberValue.includes(normalizedCaseNumber);

      return (
        matchesSupplier && matchesType && matchesPhone && matchesCaseNumber
      );
    });
    const callCenters = {};
    const hoursSet = new Set();

    filteredData.forEach((item) => {
      const hour = Number(item.HOUR);
      if (Number.isNaN(hour)) return;
      hoursSet.add(hour);

      const callCenter =
        item['CALL CENTER'] ||
        item['Call Center'] ||
        item.callCenter ||
        'Unknown';
      const agent =
        item['AGENT NAME'] || item['Agent Name'] || item.agent || 'Unassigned';
      const phoneNumber =
        item['PHONE NUMBER'] || item['Phone Number'] || item.phone || 'Unknown';
      const supplier =
        item['SUPPLIER'] || item['Supplier'] || item.supplier || 'Unknown';
      const type = item['TYPE'] || item['Type'] || item.type || 'Unknown';
      const attempts = Number(
        item.ATTEMPTS ?? item.Attempts ?? item.attempts ?? 0
      );

      if (!callCenters[callCenter]) {
        callCenters[callCenter] = {
          total: 0,
          agents: {},
          suppliers: {},
          agentsByHour: {},
          suppliersByHour: {},
          chartMeta: {},
        };
      }

      const center = callCenters[callCenter];
      center.total += attempts;

      if (!center.agents[agent]) {
        center.agents[agent] = {
          total: 0,
          phones: {},
        };
      }

      if (!center.suppliers[supplier]) {
        center.suppliers[supplier] = {
          total: 0,
          phones: {},
        };
      }

      const agentData = center.agents[agent];
      agentData.total += attempts;
      const supplierData = center.suppliers[supplier];
      supplierData.total += attempts;

      if (!agentData.phones[phoneNumber]) {
        agentData.phones[phoneNumber] = {
          total: 0,
          hours: {},
          suppliers: {},
          types: {},
        };
      }

      const phoneData = agentData.phones[phoneNumber];
      phoneData.total += attempts;
      phoneData.hours[hour] = (phoneData.hours[hour] || 0) + attempts;
      phoneData.suppliers[supplier] =
        (phoneData.suppliers[supplier] || 0) + attempts;
      phoneData.types[type] = (phoneData.types[type] || 0) + attempts;

      if (!supplierData.phones[phoneNumber]) {
        supplierData.phones[phoneNumber] = {
          total: 0,
          hours: {},
          agents: {},
          types: {},
          agentHours: {},
        };
      }

      const supplierPhoneData = supplierData.phones[phoneNumber];
      supplierPhoneData.total += attempts;
      supplierPhoneData.hours[hour] =
        (supplierPhoneData.hours[hour] || 0) + attempts;
      supplierPhoneData.agents[agent] =
        (supplierPhoneData.agents[agent] || 0) + attempts;
      supplierPhoneData.types[type] =
        (supplierPhoneData.types[type] || 0) + attempts;

      if (!supplierPhoneData.agentHours[hour]) {
        supplierPhoneData.agentHours[hour] = {};
      }
      supplierPhoneData.agentHours[hour][agent] =
        (supplierPhoneData.agentHours[hour][agent] || 0) + attempts;

      if (!center.agentsByHour[agent]) {
        center.agentsByHour[agent] = {};
      }
      center.agentsByHour[agent][hour] =
        (center.agentsByHour[agent][hour] || 0) + attempts;

      if (!center.suppliersByHour[supplier]) {
        center.suppliersByHour[supplier] = {};
      }
      center.suppliersByHour[supplier][hour] =
        (center.suppliersByHour[supplier][hour] || 0) + attempts;

      if (!center.chartMeta[agent]) {
        center.chartMeta[agent] = {};
      }

      if (!center.chartMeta[agent][hour]) {
        center.chartMeta[agent][hour] = {
          suppliers: {},
          types: {},
        };
      }

      center.chartMeta[agent][hour].suppliers[supplier] =
        (center.chartMeta[agent][hour].suppliers[supplier] || 0) + attempts;
      center.chartMeta[agent][hour].types[type] =
        (center.chartMeta[agent][hour].types[type] || 0) + attempts;
    });

    const hours = Array.from(hoursSet).sort((a, b) => a - b);
    const callCenterNames = Object.keys(callCenters);
    const selectedCenter = selectedCallCenter || callCenterNames[0];
    const centerData = callCenters[selectedCenter] || {
      total: 0,
      agents: {},
      suppliers: {},
      agentsByHour: {},
      suppliersByHour: {},
      chartMeta: {},
    };

    const agentNames = Object.keys(centerData.agentsByHour);
    const supplierNames = Object.keys(centerData.suppliersByHour);
    const supplierTotals = supplierNames.map((supplierName) => {
      const total = Object.values(
        centerData.suppliersByHour[supplierName] || {}
      ).reduce((sum, value) => sum + Number(value || 0), 0);
      return { supplierName, total };
    });

    const sortedSuppliers = supplierTotals.toSorted(
      (a, b) => b.total - a.total
    );
    const visibleSuppliers = sortedSuppliers
      .slice(0, supplierTopLimit)
      .map((item) => item.supplierName);
    const hiddenSuppliers = sortedSuppliers
      .slice(supplierTopLimit)
      .map((item) => item.supplierName);
    const colors = [
      'rgba(56, 189, 248, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(59, 130, 246, 0.8)',
    ];

    const datasets = agentNames.map((agent, index) => ({
      label: agent,
      data: hours.map((hour) => centerData.agentsByHour[agent]?.[hour] || 0),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
      metaByHour: centerData.chartMeta[agent] || {},
    }));

    const supplierDatasets = visibleSuppliers.map((supplierName, index) => ({
      label: supplierName,
      data: hours.map(
        (hour) => centerData.suppliersByHour[supplierName]?.[hour] || 0
      ),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    if (hiddenSuppliers.length) {
      const othersData = hours.map((hour) => {
        return hiddenSuppliers.reduce((sum, supplierName) => {
          return (
            sum + Number(centerData.suppliersByHour[supplierName]?.[hour] || 0)
          );
        }, 0);
      });

      supplierDatasets.push({
        label: 'Others',
        data: othersData,
        backgroundColor: 'rgba(100, 116, 139, 0.8)',
        borderColor: 'rgba(100, 116, 139, 0.8)',
        borderWidth: 1,
      });
    }

    const topAgents = Object.entries(centerData.agents).sort(
      (a, b) => b[1].total - a[1].total
    );
    const topSuppliers = Object.entries(centerData.suppliers).sort(
      (a, b) => b[1].total - a[1].total
    );

    return {
      chartData: {
        labels: hours.map((h) => `${h}:00`),
        datasets,
      },
      visibleSuppliersList: visibleSuppliers,
      supplierColors: Object.fromEntries(
        visibleSuppliers.map((name, index) => [
          name,
          colors[index % colors.length],
        ])
      ),
      supplierChartData: {
        labels: hours.map((h) => `${h}:00`),
        datasets: supplierDatasets,
      },
      supplierStats: {
        totalSuppliers: supplierNames.length,
        visibleSuppliers: visibleSuppliers.length,
        hiddenSuppliers: hiddenSuppliers.length,
      },
      callCenters,
      callCenterNames,
      selectedCenter,
      centerData,
      hours,
      topAgents,
      topSuppliers,
    };
  }, [
    attemptsData,
    selectedCallCenter,
    supplierTopLimit,
    supplierSearch,
    typeSearch,
    phoneSearch,
    caseNumberSearch,
  ]);

  const visibleSuppliersKey = attemptsSummary?.visibleSuppliersList
    ? attemptsSummary.visibleSuppliersList.join('|')
    : null;

  const supplierChartDataFinal = useMemo(() => {
    if (!attemptsSummary?.supplierChartData) return null;
    return {
      ...attemptsSummary.supplierChartData,
      datasets: attemptsSummary.supplierChartData.datasets.map((ds) => ({
        ...ds,
        hidden: activeSuppliers.size > 0 && !activeSuppliers.has(ds.label),
      })),
    };
  }, [attemptsSummary?.supplierChartData, activeSuppliers]);

  useEffect(() => {
    if (!attemptsSummary?.visibleSuppliersList) return;
    const incoming = attemptsSummary.visibleSuppliersList;
    if (prevTopLimit === 0 || supplierTopLimit <= prevTopLimit) {
      // primera carga o límite bajó: todos activos
      setActiveSuppliers(new Set(incoming));
    } else {
      // límite subió: solo los nuevos (posiciones prevTopLimit..supplierTopLimit-1)
      setActiveSuppliers(new Set(incoming.slice(prevTopLimit)));
    }
    setPrevTopLimit(supplierTopLimit);
  }, [visibleSuppliersKey]);

  useEffect(() => {
    setSelectedDetail(null);
    setIsModalOpen(false);
  }, [chartView]);

  const toggleSupplier = (supplierName) => {
    setActiveSuppliers((prev) => {
      const next = new Set(prev);
      if (next.has(supplierName)) {
        next.delete(supplierName);
      } else {
        next.add(supplierName);
      }
      return next;
    });
  };

  const getTopBreakdown = (records, limit = 2) => {
    if (!records || typeof records !== 'object') return [];

    return Object.entries(records)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name]) => name);
  };

  const isSupplierView = chartView === 'supplier';

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

  let attemptsChartContent;
  if (!attemptsSummary) {
    attemptsChartContent = (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <Typography className="text-slate-500">
          No data available for this date.
        </Typography>
        <div className="flex items-center gap-2">
          <Typography className="text-slate-700 text-sm font-medium">
            Select another date:
          </Typography>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-slate-300 text-slate-700 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>
    );
  } else if (isLoadingAttempts) {
    attemptsChartContent = (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Spinner className="h-12 w-12 text-blue-500" />
        <Typography className="text-slate-600 text-sm">
          Loading data...
        </Typography>
      </div>
    );
  } else {
    attemptsChartContent = null;
  }

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
          Phone Attempts by Hour
        </Typography>

        {attemptsChartContent ?? (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:items-start sm:justify-start">
              <Typography className="text-slate-600 text-sm">
                {chartView === 'agent'
                  ? 'Shows attempts per phone number and the agent who made them.'
                  : 'Shows attempts aggregated by supplier for each hour.'}
              </Typography>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Typography className="text-slate-700 text-sm font-medium">
                    Date:
                  </Typography>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-slate-300 text-slate-700 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                  />
                  <Button
                    size="sm"
                    color="green"
                    onClick={handleDownloadExcel}
                    disabled={isDownloading}
                    className="flex items-center gap-2"
                  >
                    {isDownloading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Downloading...
                      </>
                    ) : (
                      '📥 Download Excel'
                    )}
                  </Button>
                </div>
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
                <div className="flex items-center gap-2">
                  <Typography className="text-slate-700 text-sm font-medium">
                    Chart:
                  </Typography>
                  <select
                    value={chartView}
                    onChange={(e) => setChartView(e.target.value)}
                    className="border-slate-300 text-slate-700 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                  >
                    <option value="agent">By Agent</option>
                    <option value="supplier">By Supplier</option>
                  </select>
                </div>
                {chartView === 'supplier' && (
                  <div className="flex items-center gap-2">
                    <Typography className="text-slate-700 text-sm font-medium">
                      Show top:
                    </Typography>
                    <select
                      value={supplierTopLimit}
                      onChange={(e) =>
                        setSupplierTopLimit(Number(e.target.value))
                      }
                      className="border-slate-300 text-slate-700 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                    >
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                      <option value={15}>Top 15</option>
                      <option value={20}>Top 20</option>
                      <option value={9999}>All</option>
                    </select>
                  </div>
                )}
                <div className="text-slate-500 text-sm">
                  {attemptsSummary.hours.length > 0
                    ? `Available hours: ${attemptsSummary.hours[0]}:00 - ${attemptsSummary.hours.at(-1)}:00`
                    : 'No hours available.'}
                </div>
              </div>
              {chartView === 'supplier' &&
                attemptsSummary?.visibleSuppliersList?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attemptsSummary.visibleSuppliersList.map(
                      (supplierName) => {
                        const isActive = activeSuppliers.has(supplierName);
                        const color =
                          attemptsSummary.supplierColors?.[supplierName];
                        return (
                          <button
                            key={supplierName}
                            type="button"
                            onClick={() => toggleSupplier(supplierName)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                              isActive
                                ? 'border-transparent text-white'
                                : 'border-slate-300 text-slate-400 bg-white line-through'
                            }`}
                            style={
                              isActive
                                ? {
                                    backgroundColor: color,
                                    borderColor: color,
                                  }
                                : {}
                            }
                            title={isActive ? 'Click to hide' : 'Click to show'}
                          >
                            {supplierName}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardBody>
                    <Bar
                      data={
                        chartView === 'supplier'
                          ? supplierChartDataFinal
                          : attemptsSummary.chartData
                      }
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: chartView !== 'supplier',
                            position: 'top',
                            labels: {
                              boxWidth: 12,
                              usePointStyle: true,
                            },
                          },
                          title: {
                            display: true,
                            text:
                              chartView === 'supplier'
                                ? `Attempts per supplier by hour - ${
                                    selectedCallCenter ||
                                    attemptsSummary.callCenterNames[0]
                                  }`
                                : `Attempts per agent by hour - ${
                                    selectedCallCenter ||
                                    attemptsSummary.callCenterNames[0]
                                  }`,
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                              afterBody: (tooltipItems) => {
                                if (!tooltipItems?.length || !attemptsSummary) {
                                  return [];
                                }

                                const firstItem = tooltipItems[0];
                                const hour =
                                  attemptsSummary.hours[firstItem.dataIndex];
                                const metadata =
                                  firstItem.dataset?.metaByHour?.[hour] || null;

                                if (!metadata) return [];

                                const topSuppliers = getTopBreakdown(
                                  metadata.suppliers
                                );
                                const topTypes = getTopBreakdown(
                                  metadata.types
                                );

                                const lines = [];

                                if (topSuppliers.length) {
                                  lines.push(
                                    `Suppliers: ${topSuppliers.join(', ')}`
                                  );
                                }

                                if (topTypes.length) {
                                  lines.push(`Types: ${topTypes.join(', ')}`);
                                }

                                return lines;
                              },
                            },
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
                              text: 'Attempts',
                            },
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </CardBody>
                </Card>

                <div className="border-slate-200 rounded-xl border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Typography className="text-slate-800 text-sm font-semibold">
                      Chart Filters
                    </Typography>
                    <Button
                      size="sm"
                      variant="text"
                      color="blue"
                      onClick={() => {
                        setSupplierSearch('');
                        setTypeSearch('');
                        setPhoneSearch('');
                        setCaseNumberSearch('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="space-y-1">
                      <Typography className="text-slate-600 text-xs font-medium">
                        Supplier
                      </Typography>
                      <input
                        type="text"
                        list="supplier-options"
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        placeholder="Search supplier"
                        className="border-slate-300 text-slate-700 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                      />
                      <datalist id="supplier-options">
                        {supplierSuggestions.map((supplierName) => (
                          <option key={supplierName} value={supplierName} />
                        ))}
                      </datalist>
                    </div>

                    <div className="space-y-1">
                      <Typography className="text-slate-600 text-xs font-medium">
                        Type
                      </Typography>
                      <select
                        value={typeSearch}
                        onChange={(e) => setTypeSearch(e.target.value)}
                        className="border-slate-300 text-slate-700 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                      >
                        <option value="">All types</option>
                        {typeOptions.map((typeOption) => (
                          <option key={typeOption} value={typeOption}>
                            {typeOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Typography className="text-slate-600 text-xs font-medium">
                        Phone Number
                      </Typography>
                      <input
                        type="text"
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        placeholder="Search phone number"
                        className="border-slate-300 text-slate-700 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <Typography className="text-slate-600 text-xs font-medium">
                        Case Number
                      </Typography>
                      <input
                        type="text"
                        value={caseNumberSearch}
                        onChange={(e) => setCaseNumberSearch(e.target.value)}
                        placeholder="Search case number"
                        className="border-slate-300 text-slate-700 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Typography className="text-slate-800 font-semibold">
                    {isSupplierView ? 'Supplier Details' : 'Agent Details'}
                  </Typography>

                  {Object.entries(
                    isSupplierView
                      ? attemptsSummary.centerData.suppliers
                      : attemptsSummary.centerData.agents
                  )
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([detailName, detailData]) => (
                      <Card
                        key={detailName}
                        className="border-slate-200 border bg-white"
                      >
                        <CardBody>
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <Typography className="text-slate-800 mb-1 text-sm font-semibold">
                                {detailName}
                              </Typography>
                              <Typography className="text-slate-500 text-xs">
                                {Object.keys(detailData.phones).length} numbers
                              </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-100 text-slate-800 rounded-full px-3 py-1 text-xs font-semibold">
                                Total attempts: {detailData.total}
                              </div>
                              <Button
                                size="sm"
                                color="blue"
                                onClick={() => {
                                  setSelectedDetail(detailName);
                                  setIsModalOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
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
                              Total attempts: {summary.total}
                            </Typography>
                          </div>
                          <div className="bg-slate-800 rounded-full px-3 py-1 text-xs">
                            {isSupplierView
                              ? `${Object.keys(summary.suppliers).length} suppliers`
                              : `${Object.keys(summary.agents).length} agents`}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(isSupplierView
                            ? attemptsSummary.topSuppliers
                            : attemptsSummary.topAgents
                          )
                            .slice(0, 8)
                            .map(([name, detailData]) => (
                              <div
                                key={name}
                                className="bg-slate-900 flex flex-col gap-2 rounded-xl px-3 py-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-slate-100 text-sm font-semibold">
                                    {name}
                                  </div>
                                  <div className="text-emerald-300 text-sm font-semibold">
                                    {detailData.total}
                                  </div>
                                </div>
                                <div className="text-slate-400 text-xs">
                                  Numbers:{' '}
                                  {Object.keys(detailData.phones).length}
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

      {/* ===== DETAILS MODAL ===== */}
      <Dialog
        open={isModalOpen}
        handler={() => setIsModalOpen(false)}
        size="xl"
      >
        <DialogHeader>
          <Typography variant="h5" className="text-slate-800">
            Details of {selectedDetail}
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-96 overflow-y-auto">
          {selectedDetail && attemptsSummary && (
            <div className="space-y-4">
              {Object.entries(
                isSupplierView
                  ? attemptsSummary.centerData.suppliers[selectedDetail]
                      ?.phones || {}
                  : attemptsSummary.centerData.agents[selectedDetail]?.phones ||
                      {}
              )
                .sort((a, b) => b[1].total - a[1].total)
                .map(([phoneNumber, phoneData]) => {
                  const suppliers = getTopBreakdown(
                    phoneData.suppliers,
                    Number.MAX_SAFE_INTEGER
                  );
                  const types = getTopBreakdown(
                    phoneData.types,
                    Number.MAX_SAFE_INTEGER
                  );
                  const agents = getTopBreakdown(
                    phoneData.agents,
                    Number.MAX_SAFE_INTEGER
                  );

                  return (
                    <Card key={phoneNumber} className="border-slate-200 border">
                      <CardBody>
                        {!isSupplierView && (
                          <>
                            <Typography className="text-slate-500 mb-1 text-xs">
                              Supplier:{' '}
                              {suppliers.length
                                ? suppliers.join(', ')
                                : 'Unknown'}
                            </Typography>
                            <Typography className="text-slate-500 mb-3 text-xs">
                              Type:{' '}
                              {types.length ? types.join(', ') : 'Unknown'}
                            </Typography>
                          </>
                        )}

                        {isSupplierView && (
                          <>
                            <Typography className="text-slate-500 mb-1 text-xs">
                              Agents:{' '}
                              {agents.length ? agents.join(', ') : 'Unknown'}
                            </Typography>
                            <Typography className="text-slate-500 mb-3 text-xs">
                              Type:{' '}
                              {types.length ? types.join(', ') : 'Unknown'}
                            </Typography>
                          </>
                        )}

                        <div className="mb-3">
                          <Typography className="text-slate-900 text-sm font-semibold">
                            Number: {phoneNumber}
                          </Typography>
                          <Typography className="text-slate-500 text-xs">
                            Total attempts: {phoneData.total}
                          </Typography>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
                          {attemptsSummary.hours.map((hour) => {
                            const hourAgents = getTopBreakdown(
                              phoneData.agentHours?.[hour],
                              Number.MAX_SAFE_INTEGER
                            );

                            return (
                              <div
                                key={`${selectedDetail}-${phoneNumber}-${hour}`}
                                className="bg-slate-50 rounded-lg border p-2"
                              >
                                <div className="text-slate-500 text-xs">
                                  {hour}:00
                                </div>
                                <div className="text-slate-900 text-sm font-semibold">
                                  {phoneData.hours[hour] || 0}
                                </div>
                                {isSupplierView && hourAgents.length > 0 && (
                                  <div className="text-slate-500 mt-1 text-[10px] leading-tight">
                                    {hourAgents.join(', ')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
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
