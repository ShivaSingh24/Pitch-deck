from typing import Any, Dict, Type
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage

from PIL import Image
import torch
from diffusers import StableDiffusionPipeline
import os
from datetime import datetime

class MarketingInput(BaseModel):
    """Input schema for marketing content generator."""
    user_query: str = Field(..., description="User's marketing request or content need")

class MarketingContentTool(BaseTool):
    """Tool to generate marketing content and generate a matching image."""

    name: str = "marketing_content_generator"
    description: str = (
        "Generates marketing content and a prompt-based image using Stable Diffusion from a user query."
    )
    args_schema: Type[BaseModel] = MarketingInput

    def __init__(self, model):
        super().__init__()
        self.model: any  # LangChain-compatible LLM

    def _run(self, user_query: str) -> Dict[str, Any]:
        # Step 1: Generate marketing text
        marketing_prompt = f"""
        You are a marketing assistant. Based on the following user request, generate a detailed marketing post.

        USER QUERY:
        {user_query}

        Return the post in a clear, structured format.
        """
        marketing_response = self.model.invoke([HumanMessage(content=marketing_prompt)])

        # Step 2: Generate image prompt
        image_prompt_query = f"""
        Based on the following marketing post, generate a Stable Diffusion prompt matching its theme or message:

        MARKETING CONTENT:
        {marketing_response.content}

        Return only the visual prompt.
        """
        image_prompt_response = self.model.invoke([HumanMessage(content=image_prompt_query)])

        # # Step 3: Generate image using Stable Diffusion
        # model_id = "dreamlike-art/dreamlike-diffusion-1.0"
        # pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16, use_safetensors=True)
        # pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

        # image = pipe(image_prompt_response.content).images[0]

        # # Step 4: Save image with timestamped filename
        # os.makedirs("output", exist_ok=True)
        # filename = f"output/generated_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        # image.save(filename)

        return {
            "user_query": user_query,
            "marketing_post": marketing_response.content,
            "image_prompt": image_prompt_response.content,
            "image_path": filename
        }
