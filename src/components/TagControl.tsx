import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TagControlProps {
    fileId: number | null;
}
const TagControl: React.FC<TagControlProps> = ({ fileId }) => {
    const [tags, setTags] = useState<string[]>([]);
    const [canGenerate, setCanGenerate] = useState<boolean>(false);
    const [isButtonPressed, setIsButtonPressed] = useState(false);


    const fetchTags = async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('Токен не найден');
            return;
        }

        try {
            const response = await axios.get(`https://api2.geliusihe.ru/accounts/file/tags/${fileId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const fetchedTags = response.data.tags || [];
            setTags(fetchedTags);
            setCanGenerate(fetchedTags.length === 0);
        } catch (error) {
            console.error("Ошибка при получении тегов:", error);
        }
    };



    const handleGenerateTags = async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('Токен не найден');
            return;
        }

        try {
            const response = await axios.get(`https://api2.geliusihe.ru/accounts/file/tags/${fileId}/?generate=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.tags) {
                setTags(response.data.tags);
                setCanGenerate(false);
            }
        } catch (error) {
            console.error("Ошибка при генерации тегов:", error);
        }
    };



    useEffect(() => {
        fetchTags();
    }, [fileId]);

    return (
        <div>
            {tags.length > 0 ? (
                <p>Теги: {tags.join(', ')}</p>
            ) : (
                <p>Теги не найдены</p>
            )}
            {canGenerate && (
                <button
                    onClick={handleGenerateTags}
                    style={{
                        cursor: 'pointer',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px 20px',
                        margin: '10px 0',
                        border: 'none',
                        borderRadius: '5px',
                        opacity: isButtonPressed ? '0.7' : '1',
                        transition: 'opacity 0.3s ease',
                    }}
                    onMouseDown={() => setIsButtonPressed(true)}
                    onMouseUp={() => setIsButtonPressed(false)}
                    onMouseLeave={() => setIsButtonPressed(false)}
                >Сгенерировать теги</button>
            )}
        </div>
    );
};


export default TagControl;
