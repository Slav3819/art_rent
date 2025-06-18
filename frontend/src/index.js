import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UserStore from './store/UserStore'
import ItemStore from './store/ItemStore';

const root = ReactDOM.createRoot(document.getElementById('root'));
export const Context = createContext(null)

root.render(
  <React.StrictMode>
    <Context.Provider value={
      {
        user: new UserStore(),
        items: new ItemStore(),
      }}>
      <App />
    </Context.Provider>
    
  </React.StrictMode>
);


