import sys
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for frontend communication (e.g., React app on localhost:3000)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a Pydantic model for input validation
class Data(BaseModel):
    data: dict

# Function to process data
def process_data(data: dict):
    # Example processing logic
    processed_data = {"processed": "skibidi"}  # Replace with actual processing logic
    return processed_data

# Endpoint to receive data from the frontend, process it, and forward it
@app.post("/api/prdGenData")
def backend_data_receive(data: Data):
    print("Data received from prdGen script:")
    print(data.dict())  # Convert Pydantic object to a dictionary

    # Process the data
    processed_data = process_data(data.data)
    print("Processed data:", processed_data)

    # Forward the processed data to the frontend route (/api/GenData)
    return processed_data  # Call the function directly

# Test endpoint for debugging purposes
@app.get("/api/test")
def test_endpoint():
    return {"message": "hi backend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
