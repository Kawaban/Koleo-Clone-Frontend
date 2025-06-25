import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from "@auth0/auth0-react";
createRoot(document.getElementById('root')!).render(
  <StrictMode>


      <Auth0Provider
          domain="dev-1jlpucnk4u6by33k.us.auth0.com"
          clientId="9PfVOeao1lffpzt7VzUtjsXX1G609Le8"
          authorizationParams={{
              redirect_uri: window.location.origin,
              audience: "https://my-api.local",
              scope: "openid profile email",
              prompt: "consent",
          }}
      >
          <App />
      </Auth0Provider>
  </StrictMode>,
)
