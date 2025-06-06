from typing import Any, Dict, Type
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage

class MarketingInput(BaseModel):
    """Input schema for marketing content generator."""
    user_query: str = Field(..., description="User's marketing request or content need")

class MarketingContentTool(BaseTool):
    """Tool to generate marketing content and visual prompts from user queries."""

    name: str = "marketing_content_generator"
    description: str = (
        "Generates detailed marketing content and a visual prompt suitable for image generation tools (e.g., Stable Diffusion) based on the user query."
    )
    args_schema: Type[BaseModel] = MarketingInput

    def __init__(self, model):
        super().__init__()
        self.model: any  # a LangChain-compatible LLM

    def _run(self, user_query: str) -> Dict[str, Any]:
        # Step 1: Generate the marketing content
        marketing_prompt = f"""
        You are a marketing assistant. Based on the following user request, generate a detailed marketing post for a product or campaign.

        USER QUERY:
        {user_query}

        Return the post in a structured format.
        """
        marketing_response = self.model.invoke([HumanMessage(content=marketing_prompt)])

        # Step 2: Generate an image prompt based on that marketing text
        image_prompt_query = f"""
        Based on the following marketing post, generate a Stable Diffusion-style visual prompt to match the theme, subject, or key message:

        MARKETING CONTENT:
        {marketing_response.content}

        Return only the visual prompt.
        """
        image_prompt_response = self.model.invoke([HumanMessage(content=image_prompt_query)])

        return {
            "user_query": user_query,
            "marketing_post": marketing_response.content,
            "image_prompt": image_prompt_response.content
        }
