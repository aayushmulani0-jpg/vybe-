import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '1234567890-placeholder.apps.googleusercontent.com'; // User needs to replace this in .env

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ReactLenis root>
          <App />
        </ReactLenis>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
