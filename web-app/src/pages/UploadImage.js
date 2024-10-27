import React, { useState } from 'react';

const UploadImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [csvUrl, setCsvUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/detect/', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setImageUrl(result.image_path);
      setCsvUrl(result.csv_path);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>
      {imageUrl && (
        <div>
          <h3>Annotated Image</h3>
          <img src={imageUrl} alt="Annotated" />
        </div>
      )}
      {csvUrl && (
        <div>
          <h3>Extracted Data CSV</h3>
          <a href={csvUrl} target="_blank" rel="noopener noreferrer">
            Download CSV
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
