import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import Label from '@/widgets/forms/label';
import Select from '@/widgets/forms/select';
import Option from '@/widgets/forms/option';

export default function MonitoringFilters({
  cases,
  agentGroups = [],
  filters,
  setters,
  onSearch,
  onClear,
  user,
}) {
  const uniqueValues = (key) => [
    ...new Set(cases.map((c) => c[key]).filter(Boolean)),
  ];

  const agentOptions = [
    ...new Map(
      cases
        .filter((c) => {
          if (!c.assignedAgent) return false;

          if (
            filters.filterAgentGroup &&
            c.assignedAgent.call_center !== filters.filterAgentGroup
          ) {
            return false;
          }

          return true;
        })
        .map((c) => [c.assignedAgent.id, c.assignedAgent])
    ).values(),
  ];

  return (
    <div className="mb-4 flex flex-wrap items-end justify-center gap-4">
      <div>
        <Label>Owner Name</Label>

        <input
          type="text"
          list="owner-names"
          value={filters.filterOwnerName}
          onChange={(e) => setters.setFilterOwnerName(e.target.value)}
          placeholder="All Owners"
          className="block w-full rounded-lg border-2 border-black px-4 py-2 text-lg font-medium transition-shadow focus:shadow-[0_0_0_3px_rgba(156,163,175,0.5)] "
        />

        <datalist id="owner-names">
          {[...new Set(cases.map((c) => c.ownerName).filter(Boolean))].map(
            (owner) => (
              <option key={owner} value={owner} />
            )
          )}
        </datalist>
      </div>

      <div>
        <Label>Origin</Label>
        <Select
          value={filters.filterOrigin}
          onChange={(e) => setters.setFilterOrigin(e.target.value)}
        >
          <Option value="">All</Option>
          {uniqueValues('origin').map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={filters.filterType}
          onChange={(e) => setters.setFilterType(e.target.value)}
        >
          <Option value="">All</Option>
          {uniqueValues('type').map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Substatus</Label>
        <Select
          value={filters.filterSubstatus}
          onChange={(e) => setters.setFilterSubstatus(e.target.value)}
        >
          <Option value="">All</Option>
          {uniqueValues('substatus').map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Supplier Segment</Label>
        <Select
          value={filters.filterSupplierSegment}
          onChange={(e) => setters.setFilterSupplierSegment(e.target.value)}
        >
          <Option value="">All</Option>
          {uniqueValues('supplierSegment').map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      </div>

      {![4, 5].includes(user?.role_id) && (
        <div>
          <Label>Agent Group</Label>
          <Select
            value={filters.filterAgentGroup}
            onChange={(e) => setters.setFilterAgentGroup(e.target.value)}
          >
            <Option value="">All</Option>

            {agentGroups.map((group) => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {![4, 5].includes(user?.role_id) && (
        <div>
          <Label>Agent</Label>
          <Select
            value={filters.filterAgentId}
            onChange={(e) => setters.setFilterAgentId(e.target.value)}
          >
            <Option value="">All</Option>
            <Option value="__UNASSIGNED__">Unassigned</Option>

            {agentOptions.map((agent) => (
              <Option key={agent.id} value={agent.id}>
                {agent.fullname}
              </Option>
            ))}
          </Select>
        </div>
      )}

      <button
        onClick={onSearch}
        className="flex items-center rounded bg-[#492508] px-3 py-2 text-white"
      >
        <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
        Search
      </button>

      <button
        onClick={onClear}
        className="flex items-center rounded bg-gray-300 px-3 py-2"
      >
        <TrashIcon className="mr-2 h-5 w-5" />
        Clear
      </button>
    </div>
  );
}
