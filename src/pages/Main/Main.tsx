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
    const navigate = useNavigate();

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
        const albumName = prompt("Введите название альбома:");
        if (albumName) {
            axios.post("https://api2.geliusihe.ru/accounts/albums/create/", { name: albumName }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(() => {
                    getUserAlbums();
                })
                .catch(err => console.log(err));
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-start items-center mb-4">
                <h1 className="text-2xl font-bold">Альбомы</h1>
                <button onClick={handleAddAlbum} className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    +
                </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {albums.map(album => (
                    <div key={album.id} className="border rounded-lg p-2 cursor-pointer" onClick={() => handleAlbumClick(album.id)}>
                        <h2 className="text-xl font-semibold">{album.name}</h2>
                        <p>Создан: {formatDate(album.created_at)}</p>
                        <p>{album.is_private ? 'Приватный' : 'Публичный'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Main;
