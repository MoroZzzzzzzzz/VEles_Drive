from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import HTTPException
import os


class SPAStaticFiles(StaticFiles):
    """Custom StaticFiles class for Single Page Applications (SPA)
    
    This class serves the React index.html for any path that doesn't match
    an existing file, allowing React Router to handle client-side routing.
    """
    
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (StarletteHTTPException, HTTPException) as ex:
            if ex.status_code == 404:
                # For SPA routing, serve index.html for any non-existent path
                # that doesn't start with /api
                request_path = scope.get("path", "")
                if not request_path.startswith("/api"):
                    return await super().get_response("index.html", scope)
            raise ex