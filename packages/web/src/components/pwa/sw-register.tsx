'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Check for updates every 30 minutes
          setInterval(() => reg.update(), 30 * 60 * 1000);
        })
        .catch(() => {
          // SW registration failed — not critical, app still works
        });
    }
  }, []);

  return null;
}
