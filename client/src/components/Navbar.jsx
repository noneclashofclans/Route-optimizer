import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const userToken = localStorage.getItem('token');
        if (userToken) setLoggedIn(true);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('You have logged out');
        setLoggedIn(false);
        setTimeout(() => {
            navigate('/');
        }, 1500);
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">Route-optimizer</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    
                    <ul className="navbar-nav ms-auto">
                        {loggedIn ? (
                            <li className="nav-item d-flex align-items-center gap-2 mt-2 mt-lg-0">
                                <span style={{ background: '#185FA5', color: '#f8f5f5', padding: '5px 14px', borderRadius: '4px', fontSize: '14px', fontWeight: 500 }}>
                                    Username: {JSON.parse(localStorage.getItem('user'))?.username}
                                </span>
                                <button onClick={handleLogout} style={{ background: 'transparent', color: '#aaa', border: '1px solid #444', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                                    Logout
                                </button>
                            </li>
                        ) : location.pathname === '/sign-in' ? (
                            <li className="nav-item">
                                <a className="nav-link" href="/sign-up">Register</a>
                            </li>
                        ) :  (
                            <li className="nav-item">
                                <a className="nav-link" href="/sign-in">Login</a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar