import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { App } from './App';
import { Auth0Provider } from '@auth0/auth0-react';


const domain = "dev-tsid8k8lxstwi04c.us.auth0.com"; // <-- issuer without https://
const clientId = "jJ6EuUtL5HTNXDEavjpFup456fsB1t1w"; // <-- from auth0Config.clientId

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin + "/callback",
                audience: "https://dev-tsid8k8lxstwi04c.us.auth0.com/api/v2/", // 👈 This is CRITICAL
                scope: "read:books" // Optional: whatever scopes you defined in Auth0 API - this is guessed and not critical
            }}
        >
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Auth0Provider>
    </React.StrictMode>
);
