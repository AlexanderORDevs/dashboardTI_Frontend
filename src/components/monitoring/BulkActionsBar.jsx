import { createPortal } from 'react-dom';

export default function BulkActionsBar({ count, onAssign, onClear }) {
  return createPortal(
    <div
      className="fixed bottom-4 left-1/2 z-[9999] w-[95%] max-w-4xl -translate-x-1/2 rounded-lg px-4 py-3 shadow-lg"
      style={{ backgroundColor: '#492508' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          {count} case{count !== 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="rounded border border-white px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#492508]"
          >
            Clear selection
          </button>

          <button
            type="button"
            onClick={onAssign}
            className="rounded bg-white px-4 py-1.5 text-sm font-semibold text-[#492508] transition hover:bg-gray-100"
          >
            Assign Agent
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
