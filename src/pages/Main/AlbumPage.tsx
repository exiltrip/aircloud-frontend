import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AlbumUploadButton from "../../components/AlbumUploadButton";

interface Photo {
    id: number;
    file: string; // URL изображения
    file_type: string;
    uploaded_at: string;
}

interface PhotoWithBlobUrl extends Photo {
    blobUrl: string; // URL созданный с помощью URL.createObjectURL
}

const AlbumPage = () => {
    const { albumId } = useParams<{ albumId: string }>();
    const [photos, setPhotos] = useState<PhotoWithBlobUrl[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const token = localStorage.getItem('accessToken');

    const fetchImageAsBlobUrl = async (photo: Photo, token: string): Promise<PhotoWithBlobUrl> => {
        const previewUrl = photo.file.replace('http://', 'https://') + '/preview';
        const response = await fetch(previewUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const imageBlob = await response.blob();
        const blobUrl = URL.createObjectURL(imageBlob);
        return { ...photo, blobUrl };
    };

    const fetchFullImageAsBlobUrl = async (photoFile: string, token: string): Promise<string> => {
        const response = await fetch(photoFile.replace('http://', 'https://'), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const imageBlob = await response.blob();
        return URL.createObjectURL(imageBlob);
    };


    useEffect(() => {
        if (albumId && token) {
            axios.get(`https://api2.geliusihe.ru/accounts/albums/${albumId}/files/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(async res => {
                    const photosWithBlobUrls = await Promise.all(res.data.map((photo: Photo) => fetchImageAsBlobUrl(photo, token)));
                    setPhotos(photosWithBlobUrls);
                })
                .catch(err => console.log(err));
        }
    }, [albumId, token]);

    const handlePhotoClick = (photoFile: string) => {
        if (token) {
            const fullImageUrl = photoFile.replace('/preview', '');
            fetchFullImageAsBlobUrl(fullImageUrl, token)
                .then(blobUrl => {
                    setSelectedPhoto(blobUrl);
                })
                .catch(error => {
                    console.error('Error fetching full image:', error);
                    alert('Не удалось загрузить изображение');
                });
        } else {
            console.error('Token is not available');
        }
    };


    const handleCloseModal = () => {
        if (selectedPhoto) {
            URL.revokeObjectURL(selectedPhoto);
            setSelectedPhoto(null);
        }
    };

    const reloadPhotos = () => {
        if (!token) {
            console.error("Token is null, cannot fetch album photos.");
            return;
        }

        axios.get(`https://api2.geliusihe.ru/accounts/albums/${albumId}/files/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async res => {
                const photosWithBlobUrls = await Promise.all(res.data.map((photo: Photo) => fetchImageAsBlobUrl(photo, token)));
                setPhotos(photosWithBlobUrls);
            })
            .catch(err => console.log(err));
    };


    useEffect(() => {
        if (albumId && token) {
            reloadPhotos();
        }
    }, [albumId, token]);


    const handleDeletePhoto = async (photoId: number) => {
        if (!token || !albumId) {
            console.error("Token or albumId is missing");
            return;
        }

        try {
            const response = await axios.delete(`https://api2.geliusihe.ru/accounts/album/${albumId}/delete-file/${photoId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                alert('Фотография удалена');
                reloadPhotos();
            } else {
                alert('Не удалось удалить фотографию');
            }
        } catch (error) {
            console.error('Ошибка при удалении фотографии:', error);
            alert('Произошла ошибка при удалении фотографии');
        }
    };



    return (
        <div>
            <div>
                <div className="flex justify-start items-center mb-4">
                    <h1 className="text-3xl font-bold">Фотографии альбома</h1>
                    {albumId && token && (
                        <AlbumUploadButton albumId={parseInt(albumId, 10)} token={token} onUploadSuccess={reloadPhotos} />
                    )}
                </div>
            </div>
            <div className="flex flex-wrap">
                {photos.map(photo => (
                    <div key={photo.id} className="relative m-1" style={{ width: '200px', height: '200px' }}>
                        <img src={photo.blobUrl} alt="Фотография" className="cursor-pointer object-cover w-full h-full"
                             onClick={() => handlePhotoClick(photo.file)} />
                        <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full">
                            -
                        </button>
                    </div>
                ))}

            </div>
            {selectedPhoto && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
                    onClick={handleCloseModal}>
                    <img src={selectedPhoto} alt="Просмотр фотографии" style={{maxWidth: '80%', maxHeight: '80%'}}
                         onClick={e => e.stopPropagation()}/>
                </div>
            )}

        </div>
    );
};

export default AlbumPage;
