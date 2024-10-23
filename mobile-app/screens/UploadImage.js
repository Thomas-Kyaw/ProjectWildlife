import React, { useState } from 'react';
import { Button, View, Text, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const UploadImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState('');

  // Backend URL - Replace with your backend IP and port
  const BACKEND_URL = 'http://192.168.1.62:8000';

  const selectImage = async () => {
    setError('');
    setAnnotatedImageUrl('');

    const result = await launchImageLibrary({
      mediaType: 'photo',
    });

    if (result.didCancel) {
      setError('Image selection was cancelled.');
      return;
    }

    const file = result.assets[0];

    setLoading(true);

    // Create FormData and append the selected image
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.fileName,
      type: file.type,
    });

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
    <View>
      <Button title="Select Image" onPress={selectImage} />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {annotatedImageUrl && (
        <View>
          <Text>Annotated Image:</Text>
          <Image source={{ uri: annotatedImageUrl }} style={{ width: 300, height: 300 }} />
        </View>
      )}
    </View>
  );
};

export default UploadImage;
