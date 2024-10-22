import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { launchImageLibrary } from "react-native-image-picker";

const UploadImage = () => {
  const [annotatedImages, setAnnotatedImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImagePick = async () => {
    const options = {
      mediaType: "photo",
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        setError("Image selection was canceled.");
      } else if (response.errorCode) {
        setError(`Image Picker Error: ${response.errorMessage}`);
      } else {
        const newAnnotatedImages = [];
        setLoading(true);

        for (const file of response.assets) {
          const formData = new FormData();
          formData.append("file", {
            uri: file.uri,
            name: file.fileName,
            type: file.type,
          });

          try {
            const { data } = await axios.post(
              "http://localhost:8000/detect/",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            newAnnotatedImages.push({
              fileName: file.fileName,
              imagePath: data.image_path,
            });
            setError("");
          } catch (err) {
            setError(`Error processing ${file.fileName}. Please try again.`);
            console.error("Detection error:", err.response || err.message);
          }
        }

        setAnnotatedImages((prevImages) => [
          ...prevImages,
          ...newAnnotatedImages,
        ]);
        setLoading(false);
      }
    });
  };

  const handleReset = (index) => {
    setAnnotatedImages((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );
  };

  const handleResetAll = () => {
    setAnnotatedImages([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Animal Species Detection</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
        <Text style={styles.uploadButtonText}>Pick Image from Gallery</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {annotatedImages.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.subHeading}>Annotated Images</Text>
          <Button title="Remove All" color="#f44336" onPress={handleResetAll} />

          <ScrollView contentContainerStyle={styles.imageGrid}>
            {annotatedImages.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Text style={styles.fileName}>{img.fileName}</Text>
                <Image
                  source={{ uri: img.imagePath }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <Button
                  title="Remove"
                  color="#f44336"
                  onPress={() => handleReset(index)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
    width: "100%",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  imageGrid: {
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  fileName: {
    marginBottom: 5,
    fontSize: 14,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});

export default UploadImage;
