import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CryptoPrices from './DashBoard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  
    <CryptoPrices />
  </StrictMode>,
)
