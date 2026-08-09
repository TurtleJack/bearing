import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import '@ui/styles/tokens.css'
import '@ui/styles/base.css'
import '@ui/styles/components.css'
import './styles/home.css'
import './styles/flow.css'
import './styles/app.css'

// Everything runs locally: no auth service, no telemetry, no backend.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
