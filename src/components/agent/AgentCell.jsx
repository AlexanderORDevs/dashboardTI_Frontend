import { useState, useEffect } from 'react';
import AssignAgentModal from './AssignAgentModal';

export default function AgentCell({ row, onUpdated, isEditable = true }) {
  const [open, setOpen] = useState(false);
  const [agent, setAgent] = useState(row.assignedAgent);

  useEffect(() => {
    setAgent(row.assignedAgent);
  }, [row.assignedAgent]);

  return (
    <>
      {agent ? (
        <span
          onClick={isEditable ? () => setOpen(true) : undefined}
          className={`text-sm font-medium ${isEditable ? 'cursor-pointer text-[#492508] hover:text-[#2E1606]' : 'text-gray-500'}`}
          title={
            isEditable ? 'Click to change or remove agent' : 'Not editable'
          }
        >
          {typeof agent === 'string' ? agent : agent.fullname}
        </span>
      ) : isEditable ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-[#492508] px-3 py-1 text-sm font-medium text-white hover:bg-[#2E1606]"
        >
          Select agent
        </button>
      ) : (
        <span className="text-gray-500">-</span>
      )}

      {open && (
        <AssignAgentModal
          caseNumber={row.caseNumber}
          currentAgent={agent}
          onClose={() => setOpen(false)}
          onSaved={(newAgent) => {
            setAgent(newAgent);
            onUpdated?.();
          }}
        />
      )}
    </>
  );
}
