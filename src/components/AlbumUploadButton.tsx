/*
Пример использования компонента:
const AlbumComponent: React.FC<{ albumId: number; token: string }> = ({ albumId, token }) => {
    return <AlbumUploadButton albumId={albumId} token={token} />;
};
 */

import React, { useState, useRef } from 'react';

interface AlbumUploadButtonProps {
    albumId: number;
    token: string;
}

const AlbumUploadButton: React.FC<AlbumUploadButtonProps> = ({ albumId, token }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            handleUpload(); // Автоматически запускает загрузку файла после его выбора
        }
    };


    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }
        if (!albumId) {
            return <div>Error: No album ID provided!</div>;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', 'photo');
        formData.append('album_id', albumId.toString());

        try {
            const response = await fetch('https://api2.geliusihe.ru/accounts/upload-to-album/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                alert('Upload successful!');
            } else {
                alert('Upload failed.');
            }
        } catch (error) {
            console.error('Error uploading the file:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button onClick={handleClick}>Choose File</button>
            <button onClick={handleUpload} disabled={!file}>Upload File</button>
        </div>
    );

};

export default AlbumUploadButton;
