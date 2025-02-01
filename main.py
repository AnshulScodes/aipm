import sys
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI()

# Allow CORS for frontend communication (e.g., React app on localhost:3000)
origins = [
    "http://localhost:8000",
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
    input: str


# Function to process data
def process_data(data: str):
    processed_data = {"processed": "skibidi"}  
    return processed_data


@app.post("/api/prdGenData")
async def first_endpoint(str: str):
    # Process the data as needed
    print("Data received in first endpoint:", str)



    # Send data to the second endpoint
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:8000/api/nodesAndEdgesGenData", json={"message": str})
    


    return {"status": "Data sent to second endpoint", "response": response.json()}

@app.get("/api/nodesAndEdgesGenData")
async def second_endpoint(str: str):
    print("Data received in second endpoint:", str)
    return {"message": str}







@app.get("/api/test")
def test_endpoint():
    return {"message": "skibidi alpha toilet sigma"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

