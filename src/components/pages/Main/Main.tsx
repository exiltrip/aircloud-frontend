import React, {FC, useEffect, useState} from 'react';
import axios from "axios";

interface Photo {
    id: number;
    src: string;
    title: string;
}

interface Album {
    id: number;
    title: string;
    photos: Photo[];
}

interface MainProps {}

const Main: FC<MainProps> = () => {
    const token = localStorage.getItem("accessToken")
    const [allPhotos, setAllPhotos] = useState([{file: "", id: ""}]);
    const [loaded, setLoaded] = useState(false);
    const getAllPhotos = () => {
        axios.get("https://api2.geliusihe.ru/accounts/files/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res.data)
                setAllPhotos(res.data)
                setLoaded(true)
            })
    }
    const getPhoto = () => {
        axios.get("https://api2.geliusihe.ru/uploads/user_6/qwert2_2023-06-25_21.12.27.jpg", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res.data)
            })
    }
    const albums: Album[] = [
        {
            id: 1,
            title: 'Summer Vacation',
            photos: [
                { id: 1, src: 'photo1.jpg', title: 'Beach' },
                { id: 2, src: 'photo2.jpg', title: 'Mountain' },
                // Add more photos here
            ]
        },
        // Add more albums here
    ];

    useEffect(() => {
        getAllPhotos()
        getPhoto()
    }, [])
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Фото</h1>

            <div className="w-1/4 m-4">
                <div className="border rounded-lg p-2">
                    <h2 className="text-xl font-semibold mb-2">Все фото</h2>
                    <div className="flex flex-col">
                                {/*<img src={loaded ? allPhotos[0].file : ""} alt={"Все фото"} className="w-full h-auto rounded-md" />*/}
                                <p className="text-sm">Все фото</p>
                    </div>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Альбомы</h1>
            <div className="grid grid-cols-4 gap-4">
                {albums.map(album => (
                    <div key={album.id} className="border rounded-lg p-2">
                        <h2 className="text-xl font-semibold mb-2">{album.title}</h2>
                        <div className="grid grid-cols-2 gap-2">
                                <div key={album.photos[0].id}>
                                    <img src={album.photos[0].src} alt={album.photos[0].title} className="w-full h-auto rounded-md" />
                                </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Main;
