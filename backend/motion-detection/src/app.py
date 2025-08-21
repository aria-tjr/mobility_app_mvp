from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Motion Detection Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Motion Detection Service"}

@app.get("/")
async def root():
    return {"message": "Motion Detection Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001)
