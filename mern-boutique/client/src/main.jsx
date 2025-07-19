import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ShopContextProvider } from './context/ShopContext.jsx'
import { NotificationProvider } from './context/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <NotificationProvider>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)