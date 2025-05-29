'use client';

import { useEffect, useRef, useState } from 'react';

type RawPayload = { timestamp: number; value: number };
type HrData = { time: string; bpm: number };


/**
 * Connection status states for WebSocket
 */
export type ConnectionStatus = 'connecting' | 'online' | 'offline';

/**
 * Custom hook to manage WebSocket connection with exponential backoff,
 * heart rate data buffering, and connection status.
 * @param debug - connect to debug URL if true, else production URL
 * @param maxPoints - maximum number of points to keep
 */
export function useHeartRate(
  url: string,
  maxPoints: number = 20,
): { data: HrData[]; error: Error | null; status: ConnectionStatus } {
  const [data, setData] = useState<HrData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let unmounted = false;
    const initialDelay = 1000;
    const maxDelay = 10000;

    const connect = () => {
      // teardown previous
      wsRef.current?.close();
      setStatus('connecting');

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WS connected to', url);
        attemptRef.current = 0;
        setError(null);
        setStatus('online');
      };

      ws.onerror = () => {
        console.error('WebSocket error');
        setError(new Error('WebSocket encountered an error'));
        ws.close();
      };

      ws.onclose = () => {
        if (unmounted) return;
        setStatus('offline');
        // exponential backoff with jitter
        const backoff = Math.min(
          maxDelay,
          initialDelay * 2 ** attemptRef.current
        );
        const jitter = backoff * (0.5 + Math.random() * 0.5);
        console.warn(
          `WS closed, reconnecting in ${Math.round(jitter)}ms (attempt ${attemptRef.current + 1})`
        );
        timerRef.current = window.setTimeout(() => {
          attemptRef.current += 1;
          connect();
        }, jitter);
      };
      ws.onmessage = (evt) => {
        // Only attempt JSON.parse on messages that look like JSON
        if (typeof evt.data === 'string' && evt.data.trim().startsWith('{')) {
          try {
            const raw = JSON.parse(evt.data) as Partial<RawPayload>;
            if (
              typeof raw.timestamp === 'number' &&
              typeof raw.value === 'number'
            ) {
              const point: HrData = {
                time: new Date(raw.timestamp).toISOString(),
                bpm: raw.value,
              };
              setData((prev) => {
                const next = [...prev, point];
                return next.length > maxPoints
                  ? next.slice(next.length - maxPoints)
                  : next;
              });
            } else {
              console.warn('Unexpected payload shape:', evt.data);
            }
          } catch (err) {
            console.error('Parse error (ignored non-JSON):', err);
          }
        } else {
          // Ignore non-JSON or heartbeat messages
          console.debug('Ignored non-JSON WS message:', evt.data);
        }
      };
    };

    connect();
    return () => {
      unmounted = true;
      wsRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url, maxPoints]);

  return { data, error, status };
}
