import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from "./components/pages/Login/Login";
import Main from "./components/pages/Main/Main";
import "./App.css"
import Register from "./components/pages/Login/Register";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    useEffect(() => {
        const loggedInStatus: any = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedInStatus);
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Main/></ProtectedRoute>}/>
            </Routes>
        </BrowserRouter>
    );
}

const ProtectedRoute = ({ isLoggedIn, children }: { isLoggedIn: boolean, children: any}) => {
    if (isLoggedIn) {
        return children;
    } else {
        return <Navigate to="/login" replace />;
    }
}

export default App;
