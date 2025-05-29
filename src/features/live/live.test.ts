import '@testing-library/jest-dom';
import WS from 'jest-websocket-mock';
import { waitFor, act, renderHook } from '@testing-library/react';
import { useHeartRate } from './hooks/useHeartRate';

// Extend timeout for async WebSocket operations
jest.setTimeout(10000);

const TEST_WS_URL = 'ws://localhost:1234';

describe('useHeartRate hook', () => {
  let server: WS;

  beforeEach(() => {
    // Start mock WebSocket server
    server = new WS(TEST_WS_URL);
  });

  afterEach(() => {
    // Clean up all mock servers
    WS.clean();
  });

  it('connects and updates status to online', async () => {
    const { result } = renderHook(() => useHeartRate(TEST_WS_URL, 5));
    // Wait for the client to connect
    await server.connected;
    await waitFor(() => expect(result.current.status).toBe('online'));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('parses valid messages', async () => {
    const { result } = renderHook(() => useHeartRate(TEST_WS_URL, 5));
    await server.connected;
    await waitFor(() => expect(result.current.status).toBe('online'));

    const timestamp = Date.now();
    act(() => server.send(JSON.stringify({ timestamp, value: 75 })));
    await waitFor(() =>
      expect(result.current.data).toEqual([
        { time: new Date(timestamp).toISOString(), bpm: 75 },
      ])
    );
  });

  it('enforces maxPoints buffer', async () => {
    const max = 3;
    const { result } = renderHook(() => useHeartRate(TEST_WS_URL, max));
    await server.connected;
    await waitFor(() => expect(result.current.status).toBe('online'));

    act(() => {
      for (let i = 1; i <= max + 2; i++) {
        server.send(JSON.stringify({ timestamp: Date.now() + i, value: i * 10 }));
      }
    });
    await waitFor(() => {
      const values = result.current.data.map((d) => d.bpm);
      expect(values).toEqual([30, 40, 50]);
    });
  });

  it('goes offline on close', async () => {
    const { result } = renderHook(() => useHeartRate(TEST_WS_URL, 5));
    await server.connected;
    await waitFor(() => expect(result.current.status).toBe('online'));

    act(() => server.close());
    await waitFor(() => expect(result.current.status).toBe('offline'));
  });

  it('ignores malformed messages', async () => {
    const { result } = renderHook(() => useHeartRate(TEST_WS_URL, 5));
    await server.connected;
    await waitFor(() => expect(result.current.status).toBe('online'));

    act(() => {
      server.send('not-json');
      server.send(JSON.stringify({ foo: 'bar' }));
    });
    // short delay to ensure no change
    await new Promise((r) => setTimeout(r, 100));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();

    const timestamp = Date.now();
    act(() => server.send(JSON.stringify({ timestamp, value: 60 })));
    await waitFor(() =>
      expect(result.current.data[0]).toEqual({
        time: new Date(timestamp).toISOString(),
        bpm: 60,
      })
    );
  });
});
