import os
import sys
import shutil
import uuid

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form
)

from fastapi.middleware.cors import CORSMiddleware


# =========================================================
# PROJECT PATHS
# =========================================================

BACKEND_ROOT = os.path.dirname(
    os.path.abspath(__file__)
)

PROJECT_ROOT = os.path.dirname(
    BACKEND_ROOT
)

CV_FOLDER = os.path.join(
    PROJECT_ROOT,
    "cv"
)

if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

if CV_FOLDER not in sys.path:
    sys.path.insert(0, CV_FOLDER)


# =========================================================
# COMPUTER VISION
# =========================================================

from matcher import compare_images


# =========================================================
# NLP
# =========================================================

from src.nlp.extraction import (
    extract_keywords
)

from src.matching.matcher import (
    match_items
)


# =========================================================
# LLM
# =========================================================

from src.llm.extractor import (
    generate_llm_response
)

from src.llm.validator import (
    validate_item_description
)


# =========================================================
# DATABASE
# =========================================================

from database.connection import (
    create_tables
)

from database.crud import (
    create_item,
    get_all_items
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Lost and Found AI",
    description="AI-powered Lost and Found System",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def startup():

    create_tables()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Lost and Found AI Backend is running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# =========================================================
# NLP - EXTRACT KEYWORDS
# =========================================================

@app.get("/extract")
def extract_item_keywords(
    text: str
):

    keywords = extract_keywords(
        text
    )

    return {
        "original_text": text,
        "keywords": keywords
    }


# =========================================================
# NLP + LLM PROCESSING
# =========================================================

@app.get("/process-item")
def process_item(
    text: str
):

    is_valid = validate_item_description(
        text
    )

    if not is_valid:

        return {
            "success": False,
            "message": "Please provide a valid item description."
        }

    keywords = extract_keywords(
        text
    )

    llm_response = generate_llm_response(
        text
    )

    return {
        "success": True,
        "original_text": text,
        "keywords": keywords,
        "llm_response": llm_response
    }


# =========================================================
# ADD LOST / FOUND ITEM WITH IMAGE
# =========================================================

@app.post("/items")
async def add_item(

    item_type: str = Form(...),

    description: str = Form(...),

    image: UploadFile = File(None)

):

    # -----------------------------------------------------
    # Validate description
    # -----------------------------------------------------

    is_valid = validate_item_description(
        description
    )

    if not is_valid:

        return {
            "success": False,
            "message": "Invalid item description."
        }


    # -----------------------------------------------------
    # Extract keywords
    # -----------------------------------------------------

    keywords = extract_keywords(
        description
    )

    keywords_text = ", ".join(
        keywords
    )


    # -----------------------------------------------------
    # Save image
    # -----------------------------------------------------

    image_path = None

    if image is not None:

        upload_folder = os.path.join(
            PROJECT_ROOT,
            "cv",
            "uploads"
        )

        os.makedirs(
            upload_folder,
            exist_ok=True
        )

        unique_name = (
            f"{item_type}_"
            f"{uuid.uuid4().hex}_"
            f"{image.filename}"
        )

        image_path = os.path.join(
            upload_folder,
            unique_name
        )

        with open(
            image_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                image.file,
                buffer
            )


    # -----------------------------------------------------
    # Save item
    # -----------------------------------------------------

    item_id = create_item(

        item_type,

        description,

        keywords_text,

        image_path

    )


    return {

        "success": True,

        "item_id": item_id,

        "item_type": item_type,

        "description": description,

        "keywords": keywords,

        "image_path": image_path

    }


# =========================================================
# GET ALL ITEMS
# =========================================================

@app.get("/items")
def get_items():

    items = get_all_items()

    return {

        "success": True,

        "items": items

    }


# =========================================================
# TEXT-BASED SEMANTIC MATCHING
# =========================================================

@app.get("/match")
def match_item(

    description: str

):

    # Get all stored items
    items = get_all_items()

    matches = []


    # Compare query description with every stored item
    for item in items:

        result = match_items(

            description,

            item["description"]

        )

        similarity = result["similarity_score"]


        # Only return reasonably similar items
        if similarity >= 0.50:

            matches.append({

                "item_id": item["id"],

                "item_type": item["item_type"],

                "description": item["description"],

                "similarity": round(
                    similarity * 100,
                    2
                ),

                "similarity_score": round(
                    similarity,
                    4
                ),

                "status": result["status"]

            })


    # Highest similarity first
    matches.sort(

        key=lambda x: x["similarity"],

        reverse=True

    )


    return {

        "success": True,

        "query": description,

        "matches": matches

    }


# =========================================================
# DIRECT IMAGE COMPARISON
# =========================================================

@app.post("/compare-images")
async def compare_uploaded_images(

    lost_image: UploadFile = File(...),

    found_image: UploadFile = File(...)

):

    upload_folder = os.path.join(

        PROJECT_ROOT,

        "cv",

        "uploads"

    )

    os.makedirs(

        upload_folder,

        exist_ok=True

    )


    # -----------------------------------------------------
    # Save lost image
    # -----------------------------------------------------

    lost_path = os.path.join(

        upload_folder,

        f"compare_lost_{uuid.uuid4().hex}_"
        f"{lost_image.filename}"

    )


    with open(

        lost_path,

        "wb"

    ) as buffer:

        shutil.copyfileobj(

            lost_image.file,

            buffer

        )


    # -----------------------------------------------------
    # Save found image
    # -----------------------------------------------------

    found_path = os.path.join(

        upload_folder,

        f"compare_found_{uuid.uuid4().hex}_"
        f"{found_image.filename}"

    )


    with open(

        found_path,

        "wb"

    ) as buffer:

        shutil.copyfileobj(

            found_image.file,

            buffer

        )


    # -----------------------------------------------------
    # Compare images
    # -----------------------------------------------------

    similarity = compare_images(

        lost_path,

        found_path

    )


    similarity_percentage = round(

        float(similarity) * 100,

        2

    )


    # -----------------------------------------------------
    # Status
    # -----------------------------------------------------

    if similarity_percentage >= 80:

        match_status = "Strong Match"

    elif similarity_percentage >= 60:

        match_status = "Possible Match"

    else:

        match_status = "Low Match"


    return {

        "success": True,

        "image_similarity": similarity_percentage,

        "match_status": match_status

    }


# =========================================================
# COMBINED TEXT + IMAGE MATCHING
# =========================================================

@app.post("/combined-match")
async def combined_match(

    item_type: str = Form(...),

    description: str = Form(...),

    image: UploadFile = File(...)

):

    # -----------------------------------------------------
    # Validate description
    # -----------------------------------------------------

    is_valid = validate_item_description(
        description
    )

    if not is_valid:

        return {

            "success": False,

            "message": "Please provide a valid item description."

        }


    # -----------------------------------------------------
    # Save query image temporarily
    # -----------------------------------------------------

    upload_folder = os.path.join(

        PROJECT_ROOT,

        "cv",

        "uploads"

    )

    os.makedirs(

        upload_folder,

        exist_ok=True

    )


    query_image_path = os.path.join(

        upload_folder,

        f"query_{uuid.uuid4().hex}_"
        f"{image.filename}"

    )


    with open(

        query_image_path,

        "wb"

    ) as buffer:

        shutil.copyfileobj(

            image.file,

            buffer

        )


    # -----------------------------------------------------
    # Get database items
    # -----------------------------------------------------

    items = get_all_items()

    matches = []


    # =====================================================
    # COMPARE AGAINST DATABASE
    # =====================================================

    for item in items:

        # -------------------------------------------------
        # ONLY MATCH OPPOSITE ITEM TYPES
        # -------------------------------------------------

        if item["item_type"] == item_type:

            continue


        # -------------------------------------------------
        # TEXT SEMANTIC SIMILARITY
        # -------------------------------------------------

        text_result = match_items(

            description,

            item["description"]

        )

        text_similarity = float(

            text_result["similarity_score"]

        )


        # -------------------------------------------------
        # IMAGE SIMILARITY
        # -------------------------------------------------

        image_similarity = 0.0

        stored_image = item.get(
            "image_path"
        )


        if stored_image:

            if os.path.exists(
                stored_image
            ):

                try:

                    image_similarity = float(

                        compare_images(

                            query_image_path,

                            stored_image

                        )

                    )

                except Exception as error:

                    print(

                        "Image comparison error:",

                        error

                    )

                    image_similarity = 0.0


        # -------------------------------------------------
        # COMBINED SCORE
        # -------------------------------------------------

        combined_score = (

            (text_similarity * 0.50)

            +

            (image_similarity * 0.50)

        )


        # -------------------------------------------------
        # MATCH STATUS
        # -------------------------------------------------

        if combined_score >= 0.80:

            match_status = "Strong Match"

        elif combined_score >= 0.60:

            match_status = "Possible Match"

        else:

            match_status = "Low Match"


        # -------------------------------------------------
        # Add useful matches
        # -------------------------------------------------

        if combined_score >= 0.20:

            matches.append({

                "item_id": item["id"],

                "item_type": item["item_type"],

                "description": item["description"],

                "text_similarity": round(

                    text_similarity * 100,

                    2

                ),

                "image_similarity": round(

                    image_similarity * 100,

                    2

                ),

                "combined_score": round(

                    combined_score * 100,

                    2

                ),

                "match_status": match_status

            })


    # -----------------------------------------------------
    # Sort highest score first
    # -----------------------------------------------------

    matches.sort(

        key=lambda x: x["combined_score"],

        reverse=True

    )


    # -----------------------------------------------------
    # Return result
    # -----------------------------------------------------

    return {

        "success": True,

        "query": description,

        "query_type": item_type,

        "matches": matches

    }