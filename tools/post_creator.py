from typing import Any, Dict, Type
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline
import io
import base64

class ImageGenInput(BaseModel):
    """Input schema for the Image Generation Tool."""
    prompt: str = Field(..., description="Visual description to generate the image from.")
    text_content: str = Field(..., description="Text content to combine with the image.")

class ImageWithTextTool(BaseTool):
    """Tool to generate an image from a prompt and combine it with text."""

    name: str = "image_text_creator"
    description: str = (
        "Generates an image using Stable Diffusion from a text prompt, and combines it with marketing copy." 
        "Returns base64 image and editable text content."
    )
    args_schema: Type[BaseModel] = ImageGenInput

    def _run(self, prompt: str, text_content: str) -> Dict[str, Any]:
        # Load Stable Diffusion pipeline
        model_id = "dreamlike-art/dreamlike-diffusion-1.0"
        pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16, use_safetensors=True)
        pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

        # Generate image
        image = pipe(prompt).images[0]

        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {
            "image_base64": img_str,
            "text_content": text_content,
            "note": "You can edit the text content below the image as needed."
        }
