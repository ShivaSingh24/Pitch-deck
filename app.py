from typing import Annotated, TypedDict
from fastapi import FastAPI, Form
import requests
import os
import torch
from uuid import uuid4
from diffusers import StableDiffusionPipeline
from langchain_core.messages import HumanMessage
from langchain.chat_models import init_chat_model
from tools.OCR_Tool import OCRTool
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from fastapi.middleware.cors import CORSMiddleware


# ---- CONFIG ----

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or "*" to allow all (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cloudinary config
cloudinary.config( 
    cloud_name = "dfq7tpkep", 
    api_key = "524777251618552", 
    api_secret = "TSElZuiWJJ7Waw4k63QRB1Qojv4",  # ← Replace with actual secret
    secure=True
)

# Model and tools
model = init_chat_model("llama-3.3-70b-versatile", model_provider="groq", max_tokens=5000,temperature=0.9)
ocr_tool = OCRTool()

class Joke(TypedDict):
    response: Annotated[str, 
        "A compelling, imaginative response tailored to the user's input that includes a clear marketing message, call-to-action (CTA), target audience alignment, and emotional appeal. "
        "Use persuasive language that resonates with the user's goal—whether it's to boost brand awareness, promote a product, or drive engagement. "
        "The response should feel conversational, modern, and brand-aligned while clearly conveying benefits or features."]
    Image_prompt: Annotated[str,  "A vivid, imaginative prompt for generating a cartoon-style marketing poster. Describe characters, setting, colors, action, and objects that align with the campaign theme. "
        "Specify emotion (e.g., excitement, trust), target audience (e.g., kids, professionals), and poster elements like text overlays or brand logos. "
        "Ensure the visual supports the message of the creative response."
    ]

structured_llm = model.with_structured_output(Joke)

# Load Stable Diffusion model
pipe = StableDiffusionPipeline.from_pretrained(
    "dreamlike-art/dreamlike-diffusion-1.0",
    torch_dtype=torch.float16,
    use_safetensors=True
)
pipe = pipe.to("cuda:3")  # Adjust if needed

# ---- ROUTE ----

@app.post("/generate")
async def generate(
    pdf_url: Annotated[str, Form()],
    user_query: Annotated[str, Form()]
):
    # Step 1: Download PDF
    temp_pdf_path = f"{uuid4()}.pdf"
    print(os.path.exists(temp_pdf_path))
    try:
        response = requests.get(pdf_url)
        response.raise_for_status()
        # print(response)
        # print(response.content)
        with open(temp_pdf_path, "wb") as f:
            f.write(response.content)
            # print(response.content)
            # print('pdf created')
        # print(os.path.exists(temp_pdf_path))

    except Exception as e:
        return {"error": f"Failed to download PDF: {str(e)}"}

    # Step 2: OCR
    try:
        report = ocr_tool._run(temp_pdf_path)["extracted_text"]
        print(report)
        if not report:
            raise ValueError("No text extracted from PDF.")
    except Exception as e:
        return {"error": f"OCR failed: {str(e)}"}

    # Step 3: Summarize
    try:
        summary_prompt = f"{report}\n\nSummarize this report in 100 words."
        summary = model.invoke([HumanMessage(content=summary_prompt)])
        sum_report = summary.content
        print('----summarised:',sum_report)
    except Exception as e:
        return {"error": f"Summarization failed: {str(e)}"}

    # Step 4: Generate creative response
    try:
        # final_prompt = f"user_quer:{user_query},This is information about my company/business/startup/me: {sum_report}"
        # final_prompt = f"This is information about my company/business/startup/me: {sum_report}"
        final_prompt = f"""
        You are a marketing assistant AI.

        Your job is to generate:
        1. A creative and catchy marketing/promotion message/posts (3-4 sentences), such that it is written by some human, use some rhyming or taglines at end add hashtags as well
        2. A one-line simple image prompt describing a creative visual in hd

        Only return the following keys as output:
        - 'response': the marketing copy
        - 'image_prompt': the visual scene to depict the message

        Do not add any other fields or explain anything. Just return a valid object matching the format.

        Input:
        - user_query: {user_query}
        - business_summary: {sum_report}
        """
        result = structured_llm.invoke(final_prompt)
        image_prompt = result['image_prompt']
        print('---------result:',result)
    except Exception as e:
        return {"error": f"LLM generation failed: {str(e)}"}


    # Step 5: Generate image
    try:
        image = pipe(image_prompt).images[0]
        temp_image_path = f"/tmp/marketing_{uuid4().hex}.png"
        image.save(temp_image_path)
    except Exception as e:
        return {"error": f"Image generation failed: {str(e)}"}

    # Step 6: Upload to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(temp_image_path, public_id=f"marketing/{uuid4().hex}")
        image_url = upload_result["secure_url"]
    except Exception as e:
        return {"error": f"Cloudinary upload failed: {str(e)}"}

    # Step 7: Return output
    return {
        "response": result["response"],
        "image_url": image_url
    }
