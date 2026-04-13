import { useEffect, useState, useCallback } from 'react';

interface FileChangeEvent {
  type: string;
  path: string;
}

export function useFileWatcher(url: string = 'ws://127.0.0.1:3001/ws/files') {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>(
    'disconnected',
  );
  const [lastEvent, setLastEvent] = useState<FileChangeEvent | null>(null);
  const [onChange, setOnChange] = useState<(() => void) | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(url);
        ws.onopen = () => setStatus('connected');
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastEvent({ type: data.event, path: data.path });
            if (onChange) onChange();
          } catch {
            // ignore parse errors
          }
        };
        ws.onclose = () => {
          setStatus('disconnected');
          reconnectTimer = setTimeout(connect, 5000);
        };
        ws.onerror = () => setStatus('error');
      } catch {
        setStatus('error');
      }
    };

    connect();
    return () => {
      ws?.close();
      clearTimeout(reconnectTimer);
    };
  }, [url, onChange]);

  const registerOnChange = useCallback(
    (fn: () => void) => setOnChange(() => fn),
    [],
  );

  return { status, lastEvent, registerOnChange };
}
