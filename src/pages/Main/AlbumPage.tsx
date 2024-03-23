import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AlbumUploadButton from "../../components/AlbumUploadButton";
import TagControl from "../../components/TagControl";

interface Photo {
    id: number;
    file: string;
    file_type: string;
    uploaded_at: string;
}


interface PhotoWithBlobUrl extends Photo {
    blobUrl: string;
}

interface SearchResult {
    id: number;
    image_url: string;
}

const AlbumPage = () => {
    const { albumId } = useParams<{ albumId: string }>();
    const [photos, setPhotos] = useState<PhotoWithBlobUrl[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [selectedPhotoType, setSelectedPhotoType] = useState<'image' | 'video' | null>(null);
    const token = localStorage.getItem('accessToken');
    const [selectedPhotosIds, setSelectedPhotosIds] = useState<number[]>([]);
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
    const [filteredPhotos, setFilteredPhotos] = useState<PhotoWithBlobUrl[]>([]);
    const [tag, setTag] = useState('');

    const handleSearch = async (tag: string) => {
        if (!token) {
            console.error("Token is not available");
            return;
        }

        const encodedTag = encodeURIComponent(tag);

        try {
            const response = await fetch(`https://api2.geliusihe.ru/accounts/images-by-tag/?tag=${encodedTag}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const photosWithBlobUrls = await Promise.all(data.images.map((photo: SearchResult) => fetchImageAsBlobUrl({
                id: photo.id,
                file: photo.image_url,
                file_type: 'image',
                uploaded_at: ''
            }, token)));

            setFilteredPhotos(photosWithBlobUrls);
        } catch (error) {
            console.error('Error during the search:', error);
        }
    };

    const clearFilter = () => {
        setFilteredPhotos([]);
        setTag('');
    };



    const togglePhotoSelection = (id: number) => {
        setSelectedPhotosIds(prev => prev.includes(id) ? prev.filter(photoId => photoId !== id) : [...prev, id]);
    };
    const downloadSelectedPhotos = async () => {
        if (selectedPhotosIds.length > 0) {
            try {
                const response = await axios.post('https://api2.geliusihe.ru/accounts/download_selected_photos/', {
                    photo_ids: selectedPhotosIds,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob',
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'photos.zip');
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

            } catch (error) {
                console.error('Ошибка при скачивании фотографий:', error);
            }
        }
    };



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

    const handlePhotoClick = async (photo: PhotoWithBlobUrl) => {
        if (!token) {
            console.error('Token is not available');
            return;
        }

        setSelectedPhotoId(photo.id);
        console.log(photo.id)

        const isVideo = photo.file.endsWith('.mp4') || photo.file.endsWith('.mov');

        if (isVideo) {
            const videoUrl = photo.file.replace('http://', 'https://');
            const videoObjectUrl = await fetchVideoWithAuthorization(videoUrl, token);
            if (videoObjectUrl) {
                setSelectedPhoto(videoObjectUrl);
                setSelectedPhotoType('video');
            } else {
                console.error('Failed to load video');
            }
        } else {
            const imageUrl = photo.file.replace('http://', 'https://');
            fetchFullImageAsBlobUrl(imageUrl, token)
                .then(blobUrl => {
                    setSelectedPhoto(blobUrl);
                    setSelectedPhotoType('image');
                })
                .catch(error => {
                    console.error('Error fetching image:', error);
                });
        }
    };



    const fetchVideoWithAuthorization = async (videoUrl: RequestInfo | URL, token: string) => {
        try {
            const response = await fetch(videoUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const videoBlob = await response.blob();
            const videoObjectUrl = URL.createObjectURL(videoBlob);
            return videoObjectUrl;
        } catch (error) {
            console.error('Error fetching video:', error);
            return null;
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
            {/* Ваши кнопки и заголовок */}
            <div>
                <button onClick={downloadSelectedPhotos} className="py-2 px-4 bg-blue-500 text-white rounded">
                    Скачать выбранные
                </button>
                <div className="flex justify-start items-center mb-4">
                    <h1 className="text-3xl font-bold">Содержимое альбома</h1>
                    {albumId && token && (
                        <AlbumUploadButton albumId={parseInt(albumId, 10)} token={token}
                                           onUploadSuccess={reloadPhotos}/>
                    )}
                </div>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Введите тег..."
                    className="mr-2 p-2 border-2 border-gray-200"
                />
                <button
                    onClick={() => handleSearch(tag)}
                    className="py-2 px-4 bg-green-500 text-white rounded mr-2"
                >
                    Применить фильтр
                </button>
                <button
                    onClick={clearFilter}
                    className="py-2 px-4 bg-red-500 text-white rounded"
                >
                    Очистить фильтр
                </button>
            </div>
            {/* Отображение фотографий */}
            <div className="flex flex-wrap">
                {(filteredPhotos.length > 0 ? filteredPhotos : photos).map((photo) => (
                    <div key={photo.id} className="relative m-1" style={{width: '200px', height: '200px'}}>
                        {!photo.file_type.includes('video') ? (
                            <img
                                src={photo.blobUrl}
                                alt="Фотография"
                                className="object-cover w-full h-full"
                                onClick={() => handlePhotoClick(photo)}
                                style={{cursor: 'pointer'}}
                            />
                        ) : (
                            <video
                                controls
                                className="object-cover w-full h-full"
                                onClick={() => handlePhotoClick(photo)}
                                style={{cursor: 'pointer'}}
                            >
                                <source src={photo.blobUrl} type="video/mp4"/>
                                Ваш браузер не поддерживает видео тег.
                            </video>
                        )}

                        <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full">
                            -
                        </button>
                        <span
                            className={`absolute top-0 left-0 p-1 ${selectedPhotosIds.includes(photo.id) ? 'bg-blue-500' : 'bg-gray-500'}`}
                            onClick={() => togglePhotoSelection(photo.id)}>
✓
</span>
                    </div>
                ))}
            </div>
            {selectedPhoto && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
                    onClick={handleCloseModal}>
                    <div className="flex"
                         style={{maxWidth: '90%', maxHeight: '90%', justifyContent: 'center', alignItems: 'center'}}
                         onClick={e => e.stopPropagation()}>
                        <div style={{
                            maxWidth: '28vw',
                            maxHeight: '60vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {selectedPhotoType === 'video' ? (
                                <video controls autoPlay
                                       style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}>
                                    <source src={selectedPhoto} type="video/mp4"/>
                                </video>
                            ) : (
                                <img src={selectedPhoto} alt="Просмотр фотографии"
                                     style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}/>
                            )}
                        </div>
                        <div style={{
                            width: '300px',
                            height: '500px',
                            backgroundColor: 'white',
                            marginLeft: '20px',
                        }}>
                            <TagControl fileId={selectedPhotoId}/>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default AlbumPage;