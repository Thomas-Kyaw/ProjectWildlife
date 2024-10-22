import os
import re
import csv
import shutil
import cv2
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.cloud import vision
from ultralytics import YOLO
import concurrent.futures

# Set up FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store uploaded and annotated images
UPLOAD_DIRECTORY = "static/uploads/"
ANNOTATED_DIRECTORY = "static/annotated/"
OUTPUT_DIRECTORY = "output/"  # Directory for extracted data

# Ensure directories exist
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(ANNOTATED_DIRECTORY, exist_ok=True)
os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load YOLOv8 model (adjust the path to your custom model if needed)
model = YOLO("best.pt")  # Replace with your specific YOLO model if necessary

# Google Vision API credentials setup
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'rock-wonder-438115-i1-a8ae415e9a15.json'


def detect_text(image_path):
    client = vision.ImageAnnotatorClient()

    with open(image_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        raise Exception(f'{response.error.message}')

    # Print the detected text for debugging
    print(f"Detected text: {texts[0].description if texts else 'No text detected'}")
    
    return texts[0].description if texts else ''



import re

import re

def extract_date_time_temperature(text):
    """Extracts date, time, and temperature from the detected text."""
    
    # Regex patterns for date, time (both 24-hour and 12-hour), and temperature
    date_pattern = r'\b\d{4}-\d{2}-\d{2}\b'  # Matches YYYY-MM-DD format
    time_pattern = r'\b\d{1,2}:\d{2}:\d{2}\s?[APMapm]{0,2}\b'  # Matches 12-hour (with AM/PM) and 24-hour time
    temp_pattern = r'\b-?\d{1,2}\s?[°C°|F°F]\b'  # Matches temperature format (e.g., 20°C or 20°F)
    
    # Normalize text for proper encoding
    text = text.replace("�", "°")  # Replace the replacement character with the correct degree symbol
    
    date_matches = re.findall(date_pattern, text)
    time_matches = re.findall(time_pattern, text)
    temp_matches = re.findall(temp_pattern, text)

    # Debugging: Print the extracted matches
    print(f"Dates: {date_matches}, Times: {time_matches}, Temperatures: {temp_matches}")

    return {
        'dates': date_matches,
        'times': time_matches,
        'temperatures': temp_matches,
    }


def save_to_csv(data, output_file):
    """Saves the extracted data to a CSV file."""
    if not data:
        print("No data to write to CSV")
        return

    print(f"Data to be written to CSV: {data}")
    
    file_exists = os.path.isfile(output_file)

    with open(output_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Time", "Temperature"])
        if not file_exists:
            writer.writeheader()
        writer.writerows(data)


@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    # Save the uploaded image
    upload_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # YOLOv8 object detection
    image = cv2.imread(upload_path)
    results = model(image)
    annotated_image = results[0].plot()

    # Save the annotated image
    annotated_filename = "annotated_" + file.filename
    output_annotated_path = os.path.join(ANNOTATED_DIRECTORY, annotated_filename)
    cv2.imwrite(output_annotated_path, annotated_image)

    # Extract date, time, and temperature using Google Vision API
    detected_text = detect_text(upload_path)
    extracted_data = extract_date_time_temperature(detected_text)

    # Prepare data for saving to CSV
    dates = extracted_data['dates']
    times = extracted_data['times']
    temperatures = extracted_data['temperatures']

    all_results = []
    for i in range(min(len(dates), len(times), len(temperatures))):
        all_results.append({
            "Date": dates[i],
            "Time": times[i],
            "Temperature": temperatures[i]
        })

    # Save extracted data to CSV
    output_csv_file = os.path.join(OUTPUT_DIRECTORY, f'extracted_data_{file.filename}.csv')
    save_to_csv(all_results, output_csv_file)

    # Return URLs for both the annotated image and the CSV with extracted data
    annotated_image_url = f"http://localhost:8000/static/annotated/{annotated_filename}"
    csv_url = f"http://localhost:8000/static/{output_csv_file.replace('output/', '')}"

    return JSONResponse(content={"image_path": annotated_image_url, "csv_path": csv_url})


# Main function for processing multiple images (if required)
def process_images_concurrently(base_directory, output_directory):
    """Process multiple images concurrently, saving results to CSV."""
    image_files = [f for f in os.listdir(base_directory) if f.lower().endswith(('jpg', 'jpeg', 'png'))]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(detect_text, os.path.join(base_directory, image_file))
            for image_file in image_files
        ]
        concurrent.futures.wait(futures)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
