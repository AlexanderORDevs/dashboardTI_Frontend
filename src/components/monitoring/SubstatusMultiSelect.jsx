import { useState, useRef, useEffect } from 'react';
import Label from '@/widgets/forms/label';

export default function SubstatusMultiSelect({
  options = [],
  value = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleValue = (v) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  return (
    <div ref={ref} className="relative min-w-[220px]">
      <Label>Substatus</Label>

      {/* Input visual */}
      <div
        onClick={() => setOpen(!open)}
        className="flex min-h-[42px] cursor-pointer flex-wrap items-center gap-1 rounded-lg border-2 border-black bg-white px-3 py-1"
      >
        {value.length === 0 ? (
          <span className="text-sm text-gray-400">All</span>
        ) : (
          value.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-xs"
            >
              {v}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValue(v);
                }}
                className="text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => toggleValue(opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
