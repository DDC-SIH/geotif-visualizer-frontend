import React from 'react';

interface DownloadButtonProps {
    tileUrl: string;  // The URL to the tiling server or image
    fileName: string; // Name of the file to save
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ tileUrl, fileName }) => {
    const downloadImage = async () => {
        try {
            const response = await fetch(tileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create an invisible anchor element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // Clean up
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };

    return (
        <button onClick={downloadImage} className="download-button">
            Download Image
        </button>
    );
};

export default DownloadButton;
