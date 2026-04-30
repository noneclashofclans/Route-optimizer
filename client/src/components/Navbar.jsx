import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        // sync across tabs / changes
        const syncAuth = () => {
            const updatedUser = localStorage.getItem('user');
            setUser(updatedUser ? JSON.parse(updatedUser) : null);
        };

        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <NavLink className="navbar-brand fw-bold" to="/">
                Route Optimizer
            </NavLink>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto align-items-center gap-3">

                    {user ? (
                        <>
                            <li className="nav-item">
                                <NavLink
                                    to="/history"
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active fw-semibold' : ''}`
                                    }
                                >
                                    History
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <span className="badge bg-primary px-3 py-2">
                                    Hello, {user.username}
                                </span>
                            </li>

                            <li className="nav-item">
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-light btn-sm"
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            {location.pathname !== '/sign-in' && (
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/sign-in">
                                        Login
                                    </NavLink>
                                </li>
                            )}

                            {location.pathname !== '/sign-up' && (
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/sign-up">
                                        Register
                                    </NavLink>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;