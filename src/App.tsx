import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import './App.css';
import { HomePage } from './layouts/HomePage/HomePage';
import { Footer } from './layouts/NavbarAndFooter/Footer';
import { Navbar } from './layouts/NavbarAndFooter/Navbar';
import { SearchBooksPage } from './layouts/SearchBooksPage/SearchBooksPage';
import { ShelfPage } from './layouts/ShelfPage/ShelfPage';
import { MessagesPage } from './layouts/MessagesPage/MessagesPage';

import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';
import LoginPage from './Auth/LoginPage';
import { auth0Config } from './lib/auth0Config';
import {ReviewListPage} from "./BookCheckoutPage/ReviewListPage/ReviewListPage";
import {BookCheckoutPage} from "./BookCheckoutPage/BookCheckoutPage";

// import { BookCheckoutPage } from './layouts/BookCheckoutPage/BookCheckoutPage';
// import { ReviewListPage } from './layouts/BookCheckoutPage/ReviewListPage/ReviewListPage';

// Auth0Provider wrapper that integrates with React Router v6
const Auth0ProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const onRedirectCallback = (appState: any) => {
        navigate(appState?.returnTo || '/home');
    };

    return (
        <Auth0Provider
            domain={auth0Config.issuer}
            clientId={auth0Config.clientId}
            authorizationParams={{
                redirect_uri: auth0Config.redirectUri,
                audience: auth0Config.audience,
                scope: auth0Config.scope,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};

export const App = () => {
    return (
        <div className='d-flex flex-column min-vh-100'>
            <Navbar />
            <div>{auth0Config.redirectUri}</div>
            <div className='flex-grow-1'>
                <Routes>
                    <Route path='/' element={<Navigate to='/home' replace />} />
                    <Route path='/home' element={<HomePage />} />
                    <Route path='/search' element={<SearchBooksPage />} />
                    <Route path="/reviewlist/:bookId" element={<ReviewListPage />} />
                    <Route path="/checkout/:bookId" element={<BookCheckoutPage />} />

                    <Route path='/shelf' element={<ProtectedRoute component={ShelfPage} />} />
                    <Route path='/messages' element={<ProtectedRoute component={MessagesPage} />} />
                    <Route path='/login' element={<LoginPage />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

// Helper for protecting routes using Auth0
const ProtectedRoute = ({ component }: { component: React.ComponentType<any> }) => {
    const Component = withAuthenticationRequired(component);
    return <Component />;
};
