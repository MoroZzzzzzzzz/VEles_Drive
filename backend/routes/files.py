from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import List
from pathlib import Path
import os
from ..services.file_service import file_service
from ..auth import get_current_active_user
from ..models import User

router = APIRouter(prefix="/files", tags=["File Management"])

@router.post("/upload", response_model=dict)
async def upload_single_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload single image"""
    try:
        result = await file_service.upload_image(file)
        result["success"] = True
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload-multiple", response_model=List[dict])
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload multiple images"""
    try:
        results = await file_service.upload_multiple_images(files)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete/{filename}")
async def delete_image(
    filename: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete image file"""
    success = await file_service.delete_image(filename)
    if success:
        return {"message": "Image deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Image not found")

@router.get("/image/{size}/{filename}")
async def get_image(size: str, filename: str):
    """Serve image file"""
    # Validate size
    allowed_sizes = ["thumbnail", "medium", "large"]
    if size not in allowed_sizes:
        raise HTTPException(status_code=400, detail="Invalid image size")
    
    # Build file path
    file_path = Path(f"/app/uploads/{size}/{filename}")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "public, max-age=86400",  # Cache for 1 day
            "ETag": f'"{filename}"'
        }
    )