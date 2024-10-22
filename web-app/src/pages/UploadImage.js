import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "../styles/UploadImage.css";

const UploadImage = () => {
  const [annotatedImages, setAnnotatedImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setError("Please select an image file.");
      return;
    }

    const newAnnotatedImages = [];

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);
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
          fileName: file.name,
          imagePath: data.image_path,
        });
        setError("");
      } catch (err) {
        setError(`Error processing ${file.name}. Please try again.`);
        console.error("Detection error:", err.response || err.message);
      }
    }

    setAnnotatedImages((prevImages) => [...prevImages, ...newAnnotatedImages]);
    setLoading(false);
  };

  const handleReset = (index) => {
    setAnnotatedImages((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );
  };

  const handleResetAll = () => {
    setAnnotatedImages([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="upload-container">
      <h1>Animal Species Detection</h1>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
        )}
      </div>

      {loading && <p>Processing...</p>}

      {error && <p className="error-text">{error}</p>}

      {annotatedImages.length > 0 && (
        <div>
          <h2 className="centered-heading">Annotated Images</h2>
          <div className="button-container">
            <button onClick={handleResetAll} className="reset-all-button">
              Remove All
            </button>
          </div>
          <div className="image-grid">
            {annotatedImages.map((img, index) => (
              <div key={index} className="image-wrapper">
                <h3>{img.fileName}</h3>
                <img
                  src={img.imagePath}
                  alt={`Annotated Result for ${img.fileName}`}
                  className="image"
                />
                <button
                  onClick={() => handleReset(index)}
                  className="reset-button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
