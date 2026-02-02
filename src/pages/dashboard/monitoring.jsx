import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import CustomSwal from '@/utils/customSwal';
import { monitoringAttemps } from '@/services/salesforce/monitoring';
import AgentCell from '../../components/agent/AgentCell';
import MonitoringFilters from '../../components/monitoring/MonitoringFilters';
import BulkActionsBar from '../../components/monitoring/BulkActionsBar';
import AssignAgentModal from '../../components/agent/AssignAgentModal';
import { getAllAgents } from '../../services/agent/getAgents';
import { monitoringReport } from '../../utils/excelsExport/monitoringExcel';
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '@/context/loginContext';
import ScaleWrapper from '@/components/ScaleWrapper';

const getAttemptClass = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  if (num >= 0 && num <= 4) {
    return 'bg-red-100 text-red-700';
  }
  if (num >= 5 && num <= 9) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (num >= 10) {
    return 'bg-green-100 text-green-700';
  }
  return '';
};

export function Monitoring() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [filteredCases, setFilteredCases] = useState([]);

  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubstatus, setFilterSubstatus] = useState('');
  const [filterSupplierSegment, setFilterSupplierSegment] = useState('');
  const [filterAgentId, setFilterAgentId] = useState('');
  const [filterAgentGroup, setFilterAgentGroup] = useState('');
  const [agents, setAgents] = useState([]);
  const [filterOwnerName, setFilterOwnerName] = useState('');

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc', // 'asc' | 'desc'
  });

  const [agentGroups, setAgentGroups] = useState([]);

  const [selectedCaseNumbers, setSelectedCaseNumbers] = useState([]);
  const [openBulkAssign, setOpenBulkAssign] = useState(false);

  const fetchMonitoring = async () => {
    setLoading(true);
    setSelectedCaseNumbers([]);
    setLastSelectedIndex(null);
    setOpenBulkAssign(false);
    try {
      const { data } = await monitoringAttemps();
      setCases(Array.isArray(data) ? data : []);
      setSelectedCaseNumbers([]);
    } catch (error) {
      console.error('Error fetching monitoring:', error);
      CustomSwal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Error loading monitoring data',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCaseSelection = (caseNumber, index, event) => {
    setSelectedCaseNumbers((prev) => {
      if (event?.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);

        const rangeCases = filteredCases
          .slice(start, end + 1)
          .map((c) => c.caseNumber);

        return Array.from(new Set([...prev, ...rangeCases]));
      }

      if (prev.includes(caseNumber)) {
        return prev.filter((id) => id !== caseNumber);
      }

      return [...prev, caseNumber];
    });

    setLastSelectedIndex(index);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'desc' };
    });
  };

  useEffect(() => {
    setFilteredCases(cases);
  }, [cases]);

  useEffect(() => {
    fetchMonitoring();
  }, []);

  useEffect(() => {
    async function loadAgents() {
      const data = await getAllAgents();
      setAgents(data);

      const groups = [
        ...new Set(data.map((a) => a.call_center).filter(Boolean)),
      ];

      setAgentGroups(groups);
    }

    loadAgents();
  }, []);

  const clearFilters = () => {
    setFilterOrigin('');
    setFilterType('');
    setFilterSubstatus('');
    setFilterSupplierSegment('');
    setFilterAgentGroup('');
    setFilterAgentId('');
    setFilterOwnerName('');
    setFilteredCases(cases);
  };

  const headerDates = useMemo(() => {
    if (!filteredCases || filteredCases.length === 0) {
      return {
        date1: 'Today',
        date2: 'Yesterday',
        date3: '2 Days Ago',
      };
    }

    const firstRow = filteredCases[0];

    return {
      date1: firstRow.date1 ?? 'Today',
      date2: firstRow.date2 ?? 'Yesterday',
      date3: firstRow.date3 ?? '2 Days Ago',
    };
  }, [filteredCases]);

  const sortedCases = useMemo(() => {
    if (!sortConfig.key) return filteredCases;

    return [...filteredCases].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCases, sortConfig]);

  const handleSearch = () => {
    const result = cases.filter((row) => {
      if (filterOrigin && row.origin !== filterOrigin) return false;
      if (filterType && row.type !== filterType) return false;
      if (filterSubstatus && row.substatus !== filterSubstatus) return false;
      if (filterOwnerName && row.ownerName !== filterOwnerName) return false;
      if (
        filterSupplierSegment &&
        row.supplierSegment !== filterSupplierSegment
      )
        return false;

      if (filterAgentGroup) {
        if (!row.assignedAgent) return false;
        if (row.assignedAgent.call_center !== filterAgentGroup) return false;
      }

      if (filterAgentId) {
        if (filterAgentId === '__UNASSIGNED__') {
          if (row.assignedAgent) return false;
        } else {
          if (!row.assignedAgent) return false;
          if (String(row.assignedAgent.id) !== String(filterAgentId))
            return false;
        }
      }

      return true;
    });

    setFilteredCases(result);
  };

  const colSpan = user?.role_id === 4 || user?.role_id === 5 ? 13 : 17;

  return (
    <ScaleWrapper scale={0.6} buffer={40}>
      <div className=" mb-8 mt-12 flex flex-col gap-12">
        <Card>
          <CardHeader
            variant="gradient"
            style={{ backgroundColor: '#EEA11E' }}
            className="flex items-center justify-between p-6"
          >
            <Typography variant="h4" color="white">
              Monitoring Cases
            </Typography>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchMonitoring}
                disabled={loading}
                className={`flex items-center gap-2 rounded px-3 py-1 text-white transition
    ${
      loading
        ? 'cursor-not-allowed bg-gray-400'
        : 'bg-[#1A1A1A] hover:bg-[#000000]'
    }
  `}
              >
                <ArrowPathIcon
                  className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  monitoringReport(
                    filteredCases,
                    `monitoring_${new Date().toISOString().slice(0, 10)}.xlsx`
                  )
                }
                className={`flex items-center gap-2 rounded px-3 py-1 text-white transition
    ${
      loading
        ? 'cursor-not-allowed bg-gray-400'
        : 'bg-[#1A1A1A] hover:bg-[#000000]'
    }
  `}
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export Excel
              </button>
            </div>
          </CardHeader>
          {openBulkAssign && (
            <AssignAgentModal
              caseNumbers={selectedCaseNumbers}
              onClose={() => setOpenBulkAssign(false)}
              onSaved={() => {
                setSelectedCaseNumbers([]);
                fetchMonitoring();
              }}
            />
          )}

          <CardBody className="overflow-x-auto p-6">
            <MonitoringFilters
              cases={cases}
              agentGroups={agentGroups}
              filters={{
                filterOrigin,
                filterType,
                filterSubstatus,
                filterSupplierSegment,
                filterAgentGroup,
                filterAgentId,
                filterOwnerName,
              }}
              setters={{
                setFilterOrigin,
                setFilterType,
                setFilterSubstatus,
                setFilterSupplierSegment,
                setFilterAgentGroup,
                setFilterAgentId,
                setFilterOwnerName,
              }}
              onSearch={handleSearch}
              onClear={clearFilters}
              user={user}
            />
          </CardBody>
          {selectedCaseNumbers.length > 0 && (
            <BulkActionsBar
              count={selectedCaseNumbers.length}
              onAssign={() => setOpenBulkAssign(true)}
              onClear={() => setSelectedCaseNumbers([])}
            />
          )}

          {/* Table Attempts */}
          <CardBody className="overflow-x-auto p-6 pb-24">
            {loading ? (
              <div className="py-8 text-center">Loading data...</div>
            ) : (
              <table className="w-full min-w-[700px] table-fixed border-collapse border-2 border-[#1A1A1A]">
                <thead className="sticky top-0 z-10 bg-[#e07721] text-white">
                  <tr className="relative text-center">
                    {![4, 5].includes(user?.role_id) && (
                      <th
                        className="sticky left-0 z-20 border border-[#1A1A1A] bg-[#e07721] px-2 py-2"
                        style={{ width: '48px' }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            filteredCases.length > 0 &&
                            selectedCaseNumbers.length === filteredCases.length
                          }
                          onChange={(e) =>
                            setSelectedCaseNumbers(
                              e.target.checked
                                ? filteredCases.map((c) => c.caseNumber)
                                : []
                            )
                          }
                        />
                      </th>
                    )}
                    <th
                      className={`sticky ${![4, 5].includes(user?.role_id) ? 'left-[48px]' : 'left-0'} z-20 border border-[#1A1A1A] bg-[#e07721] px-4 py-2`}
                      style={{ width: '150px' }}
                    >
                      Case Number
                    </th>

                    {![4, 5].includes(user?.role_id) && (
                      <th
                        className="border border-[#1A1A1A] px-4 py-2"
                        style={{ width: '220px' }}
                      >
                        Case Id
                      </th>
                    )}
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Owner Name
                    </th>
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '120px' }}
                    >
                      Origin
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Supplier Segment
                    </th>
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '120px' }}
                    >
                      Type
                    </th>
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '110px' }}
                    >
                      Full Name
                    </th>
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '120px' }}
                    >
                      Phone Number
                    </th>
                    <th
                      className="border border-[#1A1A1A] px-4 py-2"
                      style={{ width: '200px' }}
                    >
                      Email
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Substatus
                    </th>
                    <th className="border border-[#1A1A1A] px-4 py-2">
                      Assigned agent
                    </th>

                    <th
                      onClick={() => handleSort('createdDate')}
                      className="cursor-pointer border border-[#1A1A1A] px-4 py-2 hover:bg-[#d46f1d]"
                    >
                      Created Date <br />
                      {headerDates.createdDate}
                      {sortConfig.key === 'createdDate' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort('attempts1')}
                      className="cursor-pointer border border-[#1A1A1A] px-4 py-2 hover:bg-[#d46f1d]"
                    >
                      Attemps <br />
                      {headerDates.date1}
                      {sortConfig.key === 'attempts1' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </th>

                    {![4, 5].includes(user?.role_id) && (
                      <th
                        onClick={() => handleSort('attempts2')}
                        className="cursor-pointer border border-[#1A1A1A] px-4 py-2 hover:bg-[#d46f1d]"
                      >
                        Attemps <br />
                        {headerDates.date2}
                        {sortConfig.key === 'attempts2' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                    )}
                    {![4, 5].includes(user?.role_id) && (
                      <th
                        onClick={() => handleSort('attempts3')}
                        className="cursor-pointer border border-[#1A1A1A] px-4 py-2 hover:bg-[#d46f1d]"
                      >
                        Attemps <br />
                        {headerDates.date3}
                        {sortConfig.key === 'attempts3' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                    )}
                    {![4, 5].includes(user?.role_id) && (
                      <th
                        onClick={() => handleSort('totalAttempts')}
                        className="cursor-pointer border border-[#1A1A1A] px-4 py-2 hover:bg-[#d46f1d]"
                      >
                        Attemps Total
                        <br />
                        {sortConfig.key === 'totalAttempts' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {cases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colSpan}
                        className="border px-4 py-6 text-center text-sm text-gray-500"
                      >
                        No cases found
                      </td>
                    </tr>
                  ) : (
                    sortedCases.map((row, idx) => (
                      <tr
                        key={row.id ?? idx}
                        className={`
    relative
    text-center
    align-middle transition-colors  
    ${selectedCaseNumbers.includes(row.caseNumber) ? 'bg-indigo-100' : ''}
  `}
                      >
                        {![4, 5].includes(user?.role_id) && (
                          <td
                            className=" cursor-pointer border border-[#1A1A1A] bg-inherit px-2 py-2 text-center align-middle"
                            onClick={(e) =>
                              toggleCaseSelection(row.caseNumber, idx, e)
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedCaseNumbers.includes(
                                row.caseNumber
                              )}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                toggleCaseSelection(row.caseNumber, idx, e)
                              }
                            />
                          </td>
                        )}
                        <td
                          className={`sticky ${![4, 5].includes(user?.role_id) ? 'left-[48px]' : 'left-0'} z-10 border border-[#1A1A1A] bg-inherit px-4 py-2 align-middle`}
                        >
                          {row.caseId ? (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  `https://imgpe.lightning.force.com/lightning/r/Case/${row.caseId}/view`,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                              className="font-medium text-[#492508] hover:text-[#2E1606]"
                            >
                              {row.caseNumber}
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>

                        {![4, 5].includes(user?.role_id) && (
                          <td className="truncate border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                            {row.caseId ?? '-'}
                          </td>
                        )}
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.ownerName ?? '-'}
                        </td>

                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.origin ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.supplierSegment ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.type ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.fullName ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.phoneNumber ?? '-'}
                        </td>
                        <td className="truncate border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.email ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.substatus ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          <AgentCell
                            row={row}
                            onUpdated={fetchMonitoring}
                            isEditable={![4, 5].includes(user?.role_id)}
                          />
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          {row.createdDate ?? '-'}
                        </td>
                        <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                          <span
                            className={`inline-block min-w-[40px] rounded px-2 py-1 font-semibold ${getAttemptClass(
                              row.attempts1
                            )}`}
                          >
                            {row.attempts1 ?? '-'}
                          </span>
                        </td>

                        {![4, 5].includes(user?.role_id) && (
                          <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                            <span
                              className={`inline-block min-w-[40px] rounded px-2 py-1 font-semibold ${getAttemptClass(
                                row.attempts2
                              )}`}
                            >
                              {row.attempts2 ?? '-'}
                            </span>
                          </td>
                        )}
                        {![4, 5].includes(user?.role_id) && (
                          <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                            <span
                              className={`inline-block min-w-[40px] rounded px-2 py-1 font-semibold ${getAttemptClass(
                                row.attempts3
                              )}`}
                            >
                              {row.attempts3 ?? '-'}
                            </span>
                          </td>
                        )}
                        {![4, 5].includes(user?.role_id) && (
                          <td className="border border-[#1A1A1A] px-4 py-2 text-center align-middle">
                            <span
                              className={`inline-block min-w-[40px] rounded px-2 py-1 font-semibold ${getAttemptClass(
                                row.totalAttempts
                              )}`}
                            >
                              {row.totalAttempts ?? '-'}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </ScaleWrapper>
  );
}

export default Monitoring;
