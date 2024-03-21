import React, { FC } from 'react';

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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Photo Gallery</h1>
            <div className="grid grid-cols-3 gap-4">
                {albums.map(album => (
                    <div key={album.id} className="border rounded-lg p-2">
                        <h2 className="text-xl font-semibold mb-2">{album.title}</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {album.photos.map(photo => (
                                <div key={photo.id}>
                                    <img src={photo.src} alt={photo.title} className="w-full h-auto rounded-md" />
                                    <p className="text-sm">{photo.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Main;
