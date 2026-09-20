import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function enableMocking(): Promise<any> {
  const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
  if (!useMocks) return;

  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}
