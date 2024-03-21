import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlbumUploadButton from "../../components/AlbumUploadButton";

interface FormData {
    username: string;
    password: string;
}

const Login: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://api2.geliusihe.ru/accounts/login/', formData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (response.status === 200 && response.data.refresh && response.data.access) {
                localStorage.setItem('isLoggedIn', "true");
                localStorage.setItem('refreshToken', response.data.refresh);
                localStorage.setItem('accessToken', response.data.access);
                navigate('/');
            } else {
                console.error('Ошибка аутентификации:', response.data.detail);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Ошибка аутентификации:', error.response?.data.detail);
            } else {
                console.error('Произошла ошибка:', error);
            }
        }

    };


    return  (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-300">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full">
                <h2 className="text-2xl font-semibold mb-4 text-center">Вход</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            className="w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Логин"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                            type="password"
                            placeholder="Пароль"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
