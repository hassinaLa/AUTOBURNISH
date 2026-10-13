from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.bookings import router as bookings_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Auto Burnish API",
    description="Backend API for Auto Burnish",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://hassinala.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# ROUTES
# =====================================================

app.include_router(bookings_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Auto Burnish API is running"
    }