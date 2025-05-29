import LiveView from '@/features/live/components/LiveView';

export default function LivePage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Heart Rate Monitor</h1>
      <LiveView />
    </main>
  );
}