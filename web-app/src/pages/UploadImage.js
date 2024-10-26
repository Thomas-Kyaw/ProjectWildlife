import React, { useState } from 'react';
import axios from 'axios';

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState('');

  const BACKEND_URL = 'http://192.168.1.62:8000';

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setAnnotatedImageUrl('');

    // Create FormData and append the image
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Make API request to FastAPI
      const response = await axios.post(`${BACKEND_URL}/detect/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Extract the annotated image URL from the response
      setAnnotatedImageUrl(response.data.image_path);
      setLoading(false);
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('API Error:', error.response || error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Image</h1>

      <input type="file" onChange={handleImageUpload} accept="image/*" />

      {loading && <p>Uploading and processing image...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {annotatedImageUrl && (
        <div>
          <h3>Annotated Image:</h3>
          <img src={annotatedImageUrl} alt="Annotated" style={{ width: '300px' }} />
        </div>
      )}
    </div>
  );
};

export default UploadImage;
