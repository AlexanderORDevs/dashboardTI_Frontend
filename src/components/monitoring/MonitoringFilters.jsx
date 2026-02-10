import { TrashIcon } from '@heroicons/react/24/outline';
import Label from '@/widgets/forms/label';
import Select from '@/widgets/forms/select';
import Option from '@/widgets/forms/option';
import SubstatusMultiSelect from './SubstatusMultiSelect';

export default function MonitoringFilters({
  cases,
  agentGroups = [],
  agents = [],
  filters,
  setters,
  onClear,
  user,
}) {
  const uniqueValues = (key) => [
    ...new Set(cases.map((c) => c[key]).filter(Boolean)),
  ];

  const agentGroupsFromCases = [
    ...new Set(cases.map((c) => c.assignedAgent?.call_center).filter(Boolean)),
  ];

  const filteredAgents = [
    ...new Map(
      cases
        .map((c) => c.assignedAgent)
        .filter((a) => a && a.fullname && a.fullname !== 'null')
        .map((a) => [a.fullname, a]) // key = fullname
    ).values(),
  ];

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      {/* OWNER */}
      <div>
        <Label>Owner Name</Label>
        <input
          type="text"
          list="owner-names"
          value={filters.filterOwnerName}
          onChange={(e) => setters.setFilterOwnerName(e.target.value)}
          placeholder="All Owners"
          className="w-full rounded-lg border-2 border-black px-4 py-2"
        />
        <datalist id="owner-names">
          {[...new Set(cases.map((c) => c.ownerName).filter(Boolean))].map(
            (owner) => (
              <option key={owner} value={owner} />
            )
          )}
        </datalist>
      </div>

      {/* ORIGIN */}
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

      {/* TYPE */}
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

      {/* SUBSTATUS */}
      <SubstatusMultiSelect
        options={uniqueValues('substatus')}
        value={filters.filterSubstatus}
        onChange={setters.setFilterSubstatus}
      />

      {/* SUPPLIER SEGMENT */}
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

      {/* AGENT GROUP */}
      {![4, 5].includes(user?.role_id) && (
        <div>
          <Label>Agent Group</Label>
          <Select
            value={filters.filterAgentGroup}
            onChange={(e) => setters.setFilterAgentGroup(e.target.value)}
          >
            <Option value="">All</Option>

            {agentGroupsFromCases.map((group) => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* AGENT */}
      {![4, 5].includes(user?.role_id) && (
        <div>
          <Label>Agent</Label>
          <Select
            value={filters.filterAgentId}
            onChange={(e) => setters.setFilterAgentId(e.target.value)}
          >
            <Option value="" label="All" />
            <Option value="__UNASSIGNED__" label="Unassigned" />

            {filteredAgents.map((agent) => (
              <Option
                key={agent.fullname}
                value={agent.fullname}
                label={agent.fullname}
              />
            ))}
          </Select>
        </div>
      )}

      {/* CLEAR */}
      <button
        onClick={onClear}
        className="flex items-center gap-2 rounded bg-gray-300 px-3 py-2"
      >
        <TrashIcon className="h-5 w-5" />
        Clear
      </button>
    </div>
  );
}
