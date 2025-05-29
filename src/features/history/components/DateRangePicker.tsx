'use client';
import { useEffect, useState } from 'react';

export type RangeOption = '5m' | '1h' | '1d' | 'custom';

interface DateRangePickerProps {
  onChange: (from: string, to: string) => void;
}
export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [option, setOption] = useState<RangeOption>('5m');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handleOptionChange = (opt: RangeOption) => {
    setOption(opt);

    // 1) If not custom, compute in epoch ms
    if (opt !== 'custom') {
      const nowMs = Date.now();
      let delta = 0;
      switch (opt) {
        case '5m':
          delta = 5 * 60 * 1000;
          break;
        case '1h':
          delta = 60 * 60 * 1000;
          break;
        case '1d':
          delta = 24 * 60 * 60 * 1000;
          break;
      }
      const fromIso = new Date(nowMs - delta).toISOString();
      const toIso   = new Date(nowMs).toISOString();
      onChange(fromIso, toIso);

    // 2) If custom, the <input type="datetime-local"> gives you a local string
    } else if (customFrom && customTo) {
      // parse as local, then .toISOString() to UTC
      const fromIso = new Date(customFrom).toISOString();
      const toIso   = new Date(customTo).toISOString();
      onChange(fromIso, toIso);
    }
  };

  useEffect(() => {
    handleOptionChange(option);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <div className="flex space-x-2">
        {(['5m','1h','1d','custom'] as RangeOption[]).map((opt) => (
          <button
            key={opt}
            className={`px-3 py-1 rounded ${
              option === opt
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleOptionChange(opt)}
          >
            {opt === '5m' ? 'Last 5m'
              : opt === '1h' ? 'Last 1h'
              : opt === '1d' ? 'Last 1d'
              : 'Custom'}
          </button>
        ))}
      </div>
      {option === 'custom' && (
        <div className="flex space-x-2">
          <input
            type="datetime-local"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="datetime-local"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            className="px-3 py-1 bg-indigo-600 text-white rounded"
            onClick={() => handleOptionChange('custom')}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}