import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FormData {
    username: string;
    password1: string;
    password2: string;
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password1: '',
        password2: '',
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
        if (formData.password1 !== formData.password2) {
            console.error('Пароли не совпадают');
            return;
        }
        try {
            const response = await axios.post('https://api2.geliusihe.ru/accounts/register/', {
                username: formData.username,
                password1: formData.password1,
                password2: formData.password2,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (response.status === 201) { // Изменено с 200 на 201
                alert('Регистрация прошла успешно!');
                navigate('/login'); // Перенаправление на страницу входа после успешной регистрации
            } else {
                console.error('Ошибка регистрации:', response.data.detail);
            }

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Ошибка регистрации:', error.response?.data.detail);
            } else {
                console.error('Произошла ошибка:', error);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-300">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full">
                <h2 className="text-2xl font-semibold mb-4 text-center">Регистрация</h2>
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
                            name="password1"
                            value={formData.password1}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                            type="password"
                            placeholder="Подтвердите пароль"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Зарегистрироваться
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
