import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Cover } from './Cover';
import { Transition } from './Transition';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <div className=' relative w-full h-screen overflow-hidden'>
      <Transition />
      <Cover />
    </div>
  </React.StrictMode>
);