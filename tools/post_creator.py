from typing import Any, Dict, Type
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline
import io
import base64
import os
from datetime import datetime

class ImagePromptInput(BaseModel):
    """Input schema for generating an image from a prompt."""
    prompt: str = Field(..., description="A detailed visual prompt for image generation from marketing_content_generators output")

class ImageGenFromPromptTool(BaseTool):
    """Tool to generate image using Stable Diffusion based on a prompt."""

    name: str = "image_generator_from_prompt"
    description: str = (
        "Generates an image using Stable Diffusion from a visual prompt. "
        "Returns base64 string and saves image to the 'output/' folder."
    )
    args_schema: Type[BaseModel] = ImagePromptInput

    def _run(self, prompt: str) -> Dict[str, Any]:
        # Load model
        model_id = "dreamlike-art/dreamlike-diffusion-1.0"
        pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16, use_safetensors=True)
        pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

        # Generate image
        image = pipe(prompt).images[0]

        # Save to output folder with timestamped filename
        os.makedirs("output", exist_ok=True)
        filename = "../output/generated_image.png"
        image.save(filename)

        # # Encode to base64
        # buffered = io.BytesIO()
        # image.save(buffered, format="PNG")
        # img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {
            "prompt_used": prompt,
            "file_saved_at": filename,
            "note": "Image saved to disk and returned in base64."
        }
