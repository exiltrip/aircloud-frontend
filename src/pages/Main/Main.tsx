import React, {FC, useEffect, useState} from 'react';
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Main: FC = () => {
    const navigate = useNavigate()

    const token = localStorage.getItem("accessToken")
    const [allPhotos, setAllPhotos] = useState([{file: "", id: ""}]);
    const [albums, setAlbums] = useState([{id: 0, name: ""}]);
    const [loaded, setLoaded] = useState(false);
    const getAllUserPhotos = () => {
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
            .catch(error => {
                if(error.response.status === 401){
                    navigate('/login');
                }
                else{
                    console.error(error)
                }
            })
    }
    const getUserAlbums = () => {
        axios.get("https://api2.geliusihe.ru/accounts/user_albums/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                setAlbums(res.data)
            })
            .catch(error => {
                if(error.response.status === 401){
                    navigate('/login');
                }
                else{
                    console.error(error)
                }
            })
    }

    useEffect(() => {
        getAllUserPhotos()
        getUserAlbums()
    }, [])
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Фото</h1>

            <div className="w-1/4 m-4">
                <div className="border rounded-lg p-2">
                    <h2 className="text-xl font-semibold mb-2">Все фото</h2>
                    <div className="flex flex-col">
                        <img src={loaded ? allPhotos[0].file : ""} alt={"Все фото"} className="w-full h-auto rounded-md" />
                        <p className="text-sm">Все фото</p>
                    </div>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Альбомы</h1>
            <div className="grid grid-cols-4 gap-4">
                { loaded ? albums.map(album => (
                    <div key={album.id} className="border rounded-lg p-2">
                        <h2 className="text-xl font-semibold mb-2">{album.name}</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <div key={album.id}>
                                <img src={album.name} alt={album.name} className="w-full h-auto rounded-md" />
                            </div>
                        </div>
                    </div>
                )) : ""}
            </div>
        </div>
    );
};

export default Main;