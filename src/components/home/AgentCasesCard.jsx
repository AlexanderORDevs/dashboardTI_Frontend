import { useState } from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function AgentCasesCard({ agentName, callCenter, cases = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="transition hover:shadow-md">
      <CardBody className="space-y-3">
        {/* Header */}
        <div>
          <Typography className="font-semibold">{agentName}</Typography>
          <Typography className="text-xs text-gray-500">
            {callCenter}
          </Typography>
        </div>

        {/* Total */}
        <div className="rounded bg-gray-900 px-3 py-1 text-center text-sm font-semibold text-white">
          {cases.length} Cases
        </div>

        {/* Toggle */}
        {cases.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-center gap-1 text-xs text-gray-500 hover:text-black"
          >
            {open ? 'Hide cases' : 'View cases'}
            <ChevronDownIcon
              className={`h-3 w-3 transition ${open ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {/* Cases List */}
        {open && (
          <div className="max-h-32 overflow-y-auto rounded border bg-gray-50 p-2 text-xs">
            <div className="flex flex-wrap gap-1">
              {cases.map((c) => (
                <span key={c} className="rounded bg-white px-2 py-1 shadow-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
