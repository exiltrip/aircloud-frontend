import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from "./pages/authorization/Login";
import Main from "./pages/Main/Main";
import "./App.css"
import Register from "./pages/authorization/Register";
import AlbumPage from "./pages/Main/AlbumPage";

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
                <Route path="/album/:albumId" element={<AlbumPage />} />
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
