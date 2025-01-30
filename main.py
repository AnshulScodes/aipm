import sys
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

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

def process_data(data: dict):
    # Process the data as needed
    # For example, you could modify the data or extract certain fields
    data = "skibidi"
    processed_data = { "processed": data }  # Example processing
    return processed_data

@app.post("/api/backendDataRecieve")
def backend_data_receive(data: dict):
    print("Data received from prdGen script:")
    processed_data = process_data(data)  # Call the processing function
    return frontend_data_receive(processed_data)  # Send processed data to the frontend route

@app.get("/api/frontendDataRecieve")
def frontend_data_receive(data: dict):
    print("Data received in frontend route:")
    return {"message": data}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

