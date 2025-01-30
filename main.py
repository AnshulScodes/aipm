import sys
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

class Data(BaseModel):
    data: dict

def process_data(data: dict):
    # Process the data as needed
    processed_data = { "processed": "skibidi" }  # Example processing
    return processed_data

@app.post("/api/prdGenData")
def backend_data_receive(data: dict):
    print("Data received from prdGen script:")
    processed_data = process_data(data)  # Call the processing function
    return prdGenData(processed_data)  # Send processed data to the frontend route


# @app.post("/api/GenData")
# def prdGenData(data: dict):
#     print("Data received in frontend route:")
#     print(data)
#     return {"message": data}  # Return the processed data as a response


@app.get("/api/test")
def prdGenData():
    return {"message": "hi backend"}




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

