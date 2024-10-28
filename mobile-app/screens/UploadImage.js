import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const UploadImage = () => {
  const [imageUri, setImageUri] = useState(null);
  const [annotatedImageUri, setAnnotatedImageUri] = useState(null); // Annotated image URI from server
  const [uploading, setUploading] = useState(false);  // State for uploading
  const [error, setError] = useState(null); // State for error messages
  const [imgurLink, setImgurLink] = useState(null); // Imgur link from server

  const baseURL = 'http://192.168.1.58:5002'; // Ensure your backend URL is correct

  // Function to select an image from the gallery
  const selectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        console.log('Selected Image URI:', result.assets[0].uri); // Debug selected image URI
        setImageUri(result.assets[0].uri);
        setAnnotatedImageUri(null);  // Reset annotated image when new image is selected
        setImgurLink(null);  // Reset Imgur link
        setError(null);  // Reset any previous errors
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Function to upload the image
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setUploading(true); // Show uploading spinner
    setError(null); // Clear previous errors

    try {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`
      });

      // Upload image to server
      const response = await axios.post(`${baseURL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 30000,  // 30-second timeout
      });

      console.log('Response from server:', response.data); // Log server response for debugging

      if (response.data.annotatedImageUrl) {
        // Add a timestamp to avoid image caching issues
        const fullAnnotatedImageUrl = `${baseURL}${response.data.annotatedImageUrl}?timestamp=${new Date().getTime()}`;
        setAnnotatedImageUri(fullAnnotatedImageUrl);  // Set the full URL for annotated image
        console.log('Annotated Image URL:', fullAnnotatedImageUrl);
      }

      if (response.data.imgurLink) {
        setImgurLink(response.data.imgurLink);  // Set the Imgur link
        console.log('Imgur Link:', response.data.imgurLink);
      }

      Alert.alert('Success', 'Image processed successfully');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload and process image';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false); // Hide uploading spinner
    }
  };

  // Watch for changes in the annotated image URI or Imgur link to re-render
  useEffect(() => {
    if (annotatedImageUri || imgurLink) {
      console.log('Rendering image from:', annotatedImageUri || imgurLink); // Log when re-rendering happens
    }
  }, [annotatedImageUri, imgurLink]);

  return (
    <View style={styles.container}>
      <Button title="Select Image" onPress={selectImage} />
      
      {imageUri && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Selected Image:</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}
      
      <Button 
        title="Upload and Process Image" 
        onPress={uploadImage} 
        disabled={uploading || !imageUri} 
      />
      
      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Uploading image...</Text>
        </View>
      )}
      
      {/* Show Imgur link image when available */}
      {imgurLink && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Annotated Image (from Imgur):</Text>
          <Image source={{ uri: imgurLink }} style={styles.image} />
          <Text style={styles.link} onPress={() => Linking.openURL(imgurLink)}>
            {imgurLink}
          </Text>
        </View>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

export default UploadImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 5,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loadingContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  error: {
    marginTop: 10,
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  }
});
