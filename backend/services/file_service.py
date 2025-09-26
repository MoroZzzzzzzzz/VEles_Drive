import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
import io
import aiofiles
from pathlib import Path

class FileService:
    def __init__(self):
        self.upload_dir = Path("/app/uploads")
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        self.image_sizes = {
            "thumbnail": (300, 200),
            "medium": (800, 600), 
            "large": (1200, 900)
        }
        
        # Create upload directories
        for size in self.image_sizes.keys():
            os.makedirs(self.upload_dir / size, exist_ok=True)
    
    def _is_allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        return Path(filename).suffix.lower() in self.allowed_extensions
    
    def _generate_filename(self, original_filename: str) -> str:
        """Generate unique filename"""
        ext = Path(original_filename).suffix.lower()
        return f"{uuid.uuid4()}{ext}"
    
    async def _resize_image(self, image_data: bytes, size: tuple) -> bytes:
        """Resize image to specified dimensions"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            
            # Resize image maintaining aspect ratio
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Create new image with exact dimensions and center the resized image
            new_image = Image.new("RGB", size, (255, 255, 255))
            paste_x = (size[0] - image.width) // 2
            paste_y = (size[1] - image.height) // 2
            new_image.paste(image, (paste_x, paste_y))
            
            # Save to bytes
            output = io.BytesIO()
            new_image.save(output, format="JPEG", quality=85, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
    
    async def upload_image(self, file: UploadFile) -> dict:
        """Upload and process single image"""
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not self._is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed: {', '.join(self.allowed_extensions)}"
            )
        
        # Read file data
        file_data = await file.read()
        
        if len(file_data) > self.max_file_size:
            raise HTTPException(status_code=400, detail="File too large")
        
        # Generate filename
        filename = self._generate_filename(file.filename)
        
        # Create different sizes
        image_urls = {}
        
        for size_name, dimensions in self.image_sizes.items():
            try:
                resized_data = await self._resize_image(file_data, dimensions)
                
                # Save file
                file_path = self.upload_dir / size_name / filename
                async with aiofiles.open(file_path, 'wb') as f:
                    await f.write(resized_data)
                
                # Generate URL (relative path for now)
                image_urls[size_name] = f"/uploads/{size_name}/{filename}"
                
            except Exception as e:
                # Clean up any created files on error
                for cleanup_size in image_urls.keys():
                    cleanup_path = self.upload_dir / cleanup_size / filename
                    if cleanup_path.exists():
                        cleanup_path.unlink()
                raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
        
        return {
            "filename": filename,
            "original_name": file.filename,
            "urls": image_urls,
            "size": len(file_data)
        }
    
    async def upload_multiple_images(self, files: List[UploadFile]) -> List[dict]:
        """Upload multiple images"""
        if len(files) > 20:  # Limit number of files
            raise HTTPException(status_code=400, detail="Too many files. Maximum 20 allowed.")
        
        results = []
        for file in files:
            try:
                result = await self.upload_image(file)
                results.append(result)
            except Exception as e:
                # Continue with other files even if one fails
                results.append({
                    "filename": file.filename,
                    "error": str(e),
                    "success": False
                })
        
        return results
    
    async def delete_image(self, filename: str) -> bool:
        """Delete image and all its sizes"""
        try:
            deleted_count = 0
            for size_name in self.image_sizes.keys():
                file_path = self.upload_dir / size_name / filename
                if file_path.exists():
                    file_path.unlink()
                    deleted_count += 1
            
            return deleted_count > 0
        except Exception:
            return False
    
    def get_image_url(self, filename: str, size: str = "medium") -> Optional[str]:
        """Get URL for image with specific size"""
        if size not in self.image_sizes:
            size = "medium"
        
        file_path = self.upload_dir / size / filename
        if file_path.exists():
            return f"/uploads/{size}/{filename}"
        return None

# Global service instance
file_service = FileService()