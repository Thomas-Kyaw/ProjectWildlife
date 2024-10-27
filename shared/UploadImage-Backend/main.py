import os
import re
import csv
import shutil
import cv2
import shutil
from datetime import datetime  # Fix: Import datetime
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException  # Fix: Added HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.cloud import vision
from ultralytics import YOLO
import concurrent.futures

# Initialize FastAPI app
app = FastAPI()

# CORS configuration to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories for storing uploads, annotated images, and CSV outputs
UPLOAD_DIRECTORY = "static/uploads/"
ANNOTATED_DIRECTORY = "static/annotated/"
OUTPUT_DIRECTORY = "output/"

# Ensure directories exist
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(ANNOTATED_DIRECTORY, exist_ok=True)
os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load YOLOv8 model
model = YOLO("best.pt")  # Adjust this path to your custom model if needed

# Set up Google Cloud Vision API credentials (replace with your credentials)
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'rock-wonder-438115-i1-a8ae415e9a15.json'

# Function to detect text from an image using Google Cloud Vision API
def detect_text(image_path):
    client = vision.ImageAnnotatorClient()

    with open(image_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        raise Exception(f'{response.error.message}')

    print(f"Detected text: {texts[0].description if texts else 'No text detected'}")
    return texts[0].description if texts else ''

# Function to extract date, time, and temperature from text
def extract_date_time_temperature(text):
    date_pattern = r'\b\d{4}-\d{2}-\d{2}\b'  # Matches YYYY-MM-DD
    time_pattern = r'\b\d{1,2}:\d{2}:\d{2}\s?[APMapm]{0,2}\b'  # Matches time (12-hour with AM/PM and 24-hour)
    temp_pattern = r'\b-?\d{1,2}\s?[°C°|F°F]\b'  # Matches temperature

    text = text.replace("�", "°")  # Normalize the degree symbol

    date_matches = re.findall(date_pattern, text)
    time_matches = re.findall(time_pattern, text)
    temp_matches = re.findall(temp_pattern, text)

    print(f"Dates: {date_matches}, Times: {time_matches}, Temperatures: {temp_matches}")
    return {
        'dates': date_matches,
        'times': time_matches,
        'temperatures': temp_matches,
    }

# Function to save extracted data to a CSV file
def save_to_csv(data, output_file):
    if not data:
        print("No data to write to CSV")
        return

    print(f"Data to be written to CSV: {data}")

    file_exists = os.path.isfile(output_file)

    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Time", "Temperature"])
        if not file_exists:
            writer.writeheader()

        # Adjust data format for writing to CSV
        # If data is a dictionary, convert it to a list of dictionaries
        rows = []
        for i in range(len(data['dates'])):
            row = {
                "Date": data['dates'][i],
                "Time": data['times'][i],
                "Temperature": data['temperatures'][i]
            }
            rows.append(row)

        writer.writerows(rows)

@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Create unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
        upload_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"File uploaded successfully to: {upload_path}")

        # Read and process image using YOLO
        image = cv2.imread(upload_path)
        if image is None:
            raise HTTPException(status_code=400, detail="Cannot read image file")

        print(f"Processing image at: {upload_path}")
        results = model(image)
        print(f"YOLO results: {results}")  # Add this line to log YOLO results

        annotated_image = results[0].plot()

        # Save annotated image
        annotated_filename = f"annotated_{unique_filename}"
        output_annotated_path = os.path.join(ANNOTATED_DIRECTORY, annotated_filename)
        cv2.imwrite(output_annotated_path, annotated_image)

        print(f"Annotated image saved to: {output_annotated_path}")

        # Process text and create CSV
        detected_text = detect_text(upload_path)
        print(f"Detected text: {detected_text}")  # Log detected text
        
        extracted_data = extract_date_time_temperature(detected_text)
        print(f"Extracted data: {extracted_data}")  # Log extracted data

        output_csv_file = os.path.join(OUTPUT_DIRECTORY, f'data_{unique_filename}.csv')
        save_to_csv(extracted_data, output_csv_file)

        print(f"CSV saved to: {output_csv_file}")

        # Clean up original upload
        os.remove(upload_path)

        return {
            "image_path": f"/static/annotated/{annotated_filename}",
            "csv_path": f"/static/output/data_{unique_filename}.csv"
        }

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
