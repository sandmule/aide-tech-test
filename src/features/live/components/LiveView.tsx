'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ConnectionStatus, useHeartRate } from '../hooks/useHeartRate';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function LiveView() {
  const [debug, setDebug] = useState(true);
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  const scheme = isProd ? 'wss' : 'ws';
  // I would env var normally but for a test I'm just hardcoding the URL switch
  const url = debug
  ? `${scheme}://aide-twwwss-be02d4b95847.herokuapp.com/ws?debug=true`
  : `${scheme}://aide-twwwss-be02d4b95847.herokuapp.com/ws`;

  const { data: messages, error, status } = useHeartRate(url, 20);

  const statusConfig: Record<ConnectionStatus, { bg: string; text: string; dot: string }> = {
    connecting: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
    online:     { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-400'  },
    offline:    { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
  };

  const { bg, text, dot } = statusConfig[status];

  const chartData = useMemo(() => ({
    labels: messages.map((m) => new Date(m.time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: messages.map((m) => m.bpm),
        fill: false,
        tension: 0.2,
      },
    ],
  }), [messages]);

  const chartOptions: ChartOptions<'line'> = useMemo(
    () => ({
      animation: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Live BPM' },
      },
      scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'BPM' }, min: 0 },
      },
    }),
    []
  );

  const { min, max, avg } = useMemo(() => {
    if (!messages.length) return { min: 0, max: 0, avg: 0 };
    const values = messages.map((m) => m.bpm);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return { min, max, avg };
  }, [messages]);

  return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>  
        <span className={`h-2 w-2 mr-1 rounded-full ${dot}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      <label className="inline-flex items-center space-x-2">
        <input
          type="checkbox"
          checked={debug}
          onChange={() => setDebug((d) => !d)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
        <span className="text-sm text-gray-700">Use Debug WS</span>
      </label>
    </div>

    {error && (
      <p className="text-red-500">Error: {error.message}</p>
    )}

    <div className="bg-white p-4 rounded shadow">
      <Line data={chartData} options={chartOptions} />
    </div>

    <div className="flex justify-around bg-gray-100 p-4 rounded shadow text-center">
      <div>
        <p className="text-sm text-gray-600">Min</p>
        <p className="text-xl font-bold">{min} bpm</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Max</p>
        <p className="text-xl font-bold">{max} bpm</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Average</p>
        <p className="text-xl font-bold">{avg.toFixed(1)} bpm</p>
      </div>
    </div>
  </div>
  );
}
