'use client';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { DateRangePicker } from '@/features/history/components/DateRangePicker';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HistoryPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<{ time: string; bpm: number }[]>([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });

  useEffect(() => {
    if (!from || !to) return;
    const fetchData = async () => {
      const [dRes, sRes] = await Promise.all([
        fetch(`/api/data?from=${from}&to=${to}`),
        fetch(`/api/stats?from=${from}&to=${to}`),
      ]);
      const dJson = await dRes.json();
      const sJson = await sRes.json();
      setData(dJson);
      setStats(sJson);
    };
    fetchData();
  }, [from, to]);

  const chartData: ChartData<'line', number[], string> = {
    labels: data.map((d) => new Date(d.time).toLocaleString()),
    datasets: [
      {
        label: 'BPM',
        data: data.map((d) => d.bpm),
        fill: false,
        tension: 0.2,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { min: 0, title: { display: true, text: 'BPM' } },
    },
  };

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Historical Data</h1>
      <DateRangePicker
        onChange={(f, t) => {
          setFrom(f);
          setTo(t);
        }}
      />
      <div className="bg-white p-4 rounded shadow">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="flex justify-around bg-gray-100 p-4 rounded shadow text-center">
        <div>
          <p className="text-sm text-gray-600">Min</p>
          <p className="text-xl font-bold">{stats.min} bpm</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Max</p>
          <p className="text-xl font-bold">{stats.max} bpm</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-xl font-bold">{stats.avg.toFixed(1)} bpm</p>
        </div>
      </div>
    </main>
  );
}
