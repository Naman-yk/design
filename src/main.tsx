import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { enableMocking } from './portal/mocks/browser';
import './portal/config/theme.css';

async function bootstrap() {
  // Initialize MSW mocks
  await enableMocking();

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

bootstrap();
