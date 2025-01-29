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

@app.post("/api/sendData")
def read_root(data: dict):
    print("data recieved", data)
    return {"message": data}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)