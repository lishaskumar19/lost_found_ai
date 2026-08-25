from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

import os
import shutil

from matcher import compare_images

app = FastAPI(title="LostVision AI - Computer Vision")

# Static files (CSS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# HTML templates
templates = Jinja2Templates(directory="templates")

# Upload folder
os.makedirs("uploads", exist_ok=True)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


@app.post("/compare-images")
async def compare_uploaded_images(
    lost_image: UploadFile = File(...),
    found_image: UploadFile = File(...)
):
    lost_path = f"uploads/lost_{lost_image.filename}"
    found_path = f"uploads/found_{found_image.filename}"

    with open(lost_path, "wb") as buffer:
        shutil.copyfileobj(lost_image.file, buffer)

    with open(found_path, "wb") as buffer:
        shutil.copyfileobj(found_image.file, buffer)

    similarity = compare_images(lost_path, found_path)

    similarity_percentage = round(float(similarity) * 100, 2)

    if similarity_percentage >= 80:
        match_status = "Strong Match"
    elif similarity_percentage >= 60:
        match_status = "Possible Match"
    else:
        match_status = "Low Match"

    return {
        "image_similarity": similarity_percentage,
        "match_status": match_status
    }