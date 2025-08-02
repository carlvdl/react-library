import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // ✅ React Router v6
import { AddNewBook } from './components/AddNewBook';
import { AdminMessages } from './components/AdminMessages';
// import { ChangeQuantityOfBooks } from '../components/ChangeQuantityOfBooks';
import { useAuth0 } from '@auth0/auth0-react';
import {SpinnerLoading} from "../layouts/Utils/SpinnerLoading";
import {ChangeQuantityOfBooks} from "./ChangeQuantityOfBooks";
// import {ChangeQuantityOfBooks} from "./ChangeQuantityOfBooks";
// import { SpinnerLoading } from '../Utils/SpinnerLoading';

export const ManageLibraryPage = () => {
    const { getIdTokenClaims } = useAuth0();

    const [roles, setRoles] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedTab, setSelectedTab] = useState<'add' | 'quantity' | 'messages'>('add');

    useEffect(() => {
        const fetchRoles = async () => {
            const claims = await getIdTokenClaims();
            const fetchedRoles = claims?.['https://luv2code-react-library.com/roles'] || [];
            setRoles(fetchedRoles);
            setLoading(false);
        };

        fetchRoles();
    }, [getIdTokenClaims]);

    if (loading) return <SpinnerLoading />;

    if (!roles?.includes('admin')) return <Navigate to="/home" replace />;

    return (
        <div className="container">
            <div className="mt-5">
                <h3>Manage Library</h3>

                <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                            onClick={() => setSelectedTab('add')}
                            className={`nav-link ${selectedTab === 'add' ? 'active' : ''}`}
                            id="nav-add-book-tab"
                            type="button"
                            role="tab"
                        >
                            Add new book
                        </button>
                        <button
                            onClick={() => setSelectedTab('quantity')}
                            className={`nav-link ${selectedTab === 'quantity' ? 'active' : ''}`}
                            id="nav-quantity-tab"
                            type="button"
                            role="tab"
                        >
                            Change quantity
                        </button>
                        <button
                            onClick={() => setSelectedTab('messages')}
                            className={`nav-link ${selectedTab === 'messages' ? 'active' : ''}`}
                            id="nav-messages-tab"
                            type="button"
                            role="tab"
                        >
                            Messages
                        </button>
                    </div>
                </nav>

                <div className="tab-content mt-4" id="nav-tabContent">
                    {selectedTab === 'add' && (
                        <div className="tab-pane fade show active" id="nav-add-book" role="tabpanel">
                            <AddNewBook />
                        </div>
                    )}

                    {selectedTab === 'quantity' && (
                        <div className="tab-pane fade show active" id="nav-quantity" role="tabpanel">
                            <ChangeQuantityOfBooks />
                        </div>
                    )}

                    {selectedTab === 'messages' && (
                        <div className="tab-pane fade show active" id="nav-messages" role="tabpanel">
                            <AdminMessages />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
