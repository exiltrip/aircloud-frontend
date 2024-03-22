import React, { useState, useRef } from 'react';

interface AlbumUploadButtonProps {
    albumId: number;
    token: string;
    onUploadSuccess: () => void;
}

const AlbumUploadButton: React.FC<AlbumUploadButtonProps> = ({ albumId, token, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            handleUpload(event.target.files[0]);
        }
    };

    const handleUpload = async (selectedFile: File) => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
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
                onUploadSuccess();
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
                accept="image/*,video/*" // Разрешаем загрузку изображений и видео
                style={{display: 'none'}}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button onClick={handleClick}
                    className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Загрузить
            </button>
        </div>
    );
};

export default AlbumUploadButton;
