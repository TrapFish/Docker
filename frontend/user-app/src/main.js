import './style.css';
import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import UserForm from './components/UserForm.jsx';

const root = createRoot(document.getElementById('app'));

root.render(
  createElement(
    StrictMode,
    null,
    createElement(UserForm)
  )
);
