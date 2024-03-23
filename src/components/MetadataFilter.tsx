import React, { useState, useEffect } from 'react';

interface Photo {
    id: number;
    file: string;
    file_type: string;
    uploaded_at: string;
}

interface MetadataFilterProps {
    photos: Photo[];
    setFilteredPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
    token: string;
}

const MetadataFilter: React.FC<MetadataFilterProps> = ({ photos, setFilteredPhotos, token }) => {    const [make, setMake] = useState('');
    const [model, setModel] = useState('');

    useEffect(() => {
        setFilteredPhotos(photos);
    }, [photos]);

    useEffect(() => {
        const fetchMetadataAndFilter = async () => {
            if (!make && !model) {
                setFilteredPhotos(photos);
                return;
            }

            const filteredPhotos = [];
            for (let photo of photos) {
                const metadataUrl = `https://api2.geliusihe.ru/metadata/user_8/metadata/${photo.file.replace(/\.\w+$/, '.json')}`;
                try {
                    const response = await fetch(metadataUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const metadata = await response.json();
                    if (matchesFilter(metadata)) {
                        filteredPhotos.push(photo);
                    }
                } catch (error) {
                    console.error('Error fetching metadata:', error);
                }
            }
            setFilteredPhotos(filteredPhotos);
        };

        if (token) {
            fetchMetadataAndFilter();
        }
    }, [make, model, photos, token]);

    const matchesFilter = (metadata: { Make: string; Model: string; }) => {
        return (!make || metadata.Make === make) && (!model || metadata.Model === model);
    };

    return (
        <div>
            <select value={make} onChange={(e) => setMake(e.target.value)}>
                <option value="">Выберите производителя</option>
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="">Выберите модель</option>
            </select>
        </div>
    );
};

export default MetadataFilter;
