import React, { FC, useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

interface Album {
    id: number;
    name: string;
    created_at: string;
    is_private: boolean;
}

const Main: FC = () => {
    const token = localStorage.getItem("accessToken");
    const [albums, setAlbums] = useState<Album[]>([]);
    const [showAlbumOptions, setShowAlbumOptions] = useState(false);
    const [albumType, setAlbumType] = useState<'private' | 'group' | ''>('');
    const [groupMembers, setGroupMembers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');
    const navigate = useNavigate();

    const downloadAlbum = async (albumId: any) => {
        if (!token) {
            console.error("Token is not available");
            return;
        }

        try {
            const response = await axios.get(`https://api2.geliusihe.ru/accounts/albums/${albumId}/download/`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Указываем, что ожидаем бинарные данные
            });

            // Создаем URL для скачивания
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Создаем временный элемент для скачивания
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `album_${albumId}.zip`); // Назначаем имя файла
            document.body.appendChild(link);
            link.click();

            // Очистка после скачивания
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Ошибка при скачивании альбома:', error);
        }
    };


    const getUserAlbums = () => {
        axios.get("https://api2.geliusihe.ru/accounts/user_albums/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                setAlbums(res.data);
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        getUserAlbums();
    }, []);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleAlbumClick = (albumId: number) => {
        navigate(`/album/${albumId}`);
    };

    const handleAddAlbum = () => {
        setShowAlbumOptions(!showAlbumOptions);
        setAlbumType('');
    };

    const handleCreateGroupAlbum = () => {
        if (!groupName.trim()) {
            alert('Название альбома не может быть пустым');
            return;
        }
        if (groupMembers.length === 0) {
            alert('Добавьте хотя бы одного пользователя в групповой альбом');
            return;
        }
        createAlbum(groupName, true);
        setGroupName('');
    };

    const createAlbum = (albumName: string, isGroup: boolean = false) => {
        const url = isGroup ? "https://api2.geliusihe.ru/accounts/group-albums/create/" : "https://api2.geliusihe.ru/accounts/albums/create/";
        const data = isGroup ? { name: albumName, members: groupMembers } : { name: albumName };

        axios.post(url, data, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                getUserAlbums();
                setAlbumType('');
                setShowAlbumOptions(false);
                setGroupMembers([]);
            })
            .catch(err => console.log(err));
    };

    const addGroupMember = () => {
        const username = prompt("Введите имя пользователя:");
        if (username && !groupMembers.includes(username)) {
            setGroupMembers([...groupMembers, username]);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-start items-center mb-4">
                <h1 className="text-2xl font-bold">Альбомы</h1>
                <button onClick={handleAddAlbum}
                        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    +
                </button>
                {showAlbumOptions && (
                    <div className="ml-4">
                        <button onClick={() => setAlbumType('private')}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Приватный
                        </button>
                        <button onClick={() => setAlbumType('group')}
                                className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Групповой
                        </button>
                    </div>
                )}
            </div>
            {albumType && (
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder={albumType === 'group' ? "Введите название группового альбома" : "Введите название приватного альбома"}
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="border p-2"
                    />
                    {albumType === 'group' && (
                        <div>
                            <button onClick={addGroupMember}
                                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Добавить
                                пользователя
                            </button>
                            {groupMembers.map(member => <div key={member}>{member}</div>)}
                        </div>
                    )}
                    <button onClick={() => createAlbum(groupName, albumType === 'group')}
                            className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Создать {albumType === 'group' ? 'групповой' : 'приватный'} альбом
                    </button>
                </div>
            )}
            <div className="grid grid-cols-4 gap-4">
                {albums.map(album => (
                    <div key={album.id} className="border rounded-lg p-2 cursor-pointer"
                         onClick={() => handleAlbumClick(album.id)}>
                        <h2 className="text-xl font-semibold">{album.name}</h2>
                        <p>Создан: {formatDate(album.created_at)}</p>
                        <p>{album.is_private ? 'Приватный' : 'Групповой'}</p>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            downloadAlbum(album.id);
                        }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                            Скачать
                        </button>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default Main;
