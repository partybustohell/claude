import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/global.css';
import System from './System';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <System />
  </StrictMode>,
);
