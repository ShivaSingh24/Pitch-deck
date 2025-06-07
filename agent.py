import getpass
import os
import shutil
import cv2
import json
import numpy as np
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langchain.chat_models import init_chat_model
from langgraph.prebuilt import create_react_agent
from langchain_community.tools import DuckDuckGoSearchResults
import gradio as gr

from tools.marketing_content import MarketingContentTool
from tools.OCR_Tool import OCRTool
from tools.post_creator import ImageGenFromPromptTool

# Load environment
load_dotenv()

# Initialize tools and models
websearch1 = DuckDuckGoSearchResults(output_format="list")
ocr_tool = OCRTool()

if not os.environ.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = getpass.getpass("Enter API key for Groq: ")

model_llm = init_chat_model("llama-3.1-8b-instant", model_provider="groq", max_tokens=2000)

marketing_content = MarketingContentTool(model=model_llm)
post_creator = ImageGenFromPromptTool()

tools = [websearch1, marketing_content,post_creator]

# Initialize memory and agent
memory = MemorySaver()
agent_executor = create_react_agent(model_llm, tools, checkpointer=memory)
# result = agent_executor.invoke(
#     {"messages": [HumanMessage(content=message_content)]},
#     config | {"recursion_limit": 5},  # Lower if you want to debug early
#     checkpointer=memory
# )

config = {
    "configurable": {
        "thread_id": "medchat_001",
        "checkpoint_ns": "namespace_1",
        "checkpoint_id": "chk_001",
      
    }
}


# def save_uploaded_file(input_file, save_dir="../uploads"):
#     """Save uploaded file (image or PDF) to the specified directory."""
#     os.makedirs(save_dir, exist_ok=True)
#     save_path = os.path.join(save_dir, "report.pdf")
#     shutil.copy(input_file, save_path)
#     print(f"File saved at: {save_path}")
#     return save_path


def process_query(input_text, input_image, input_pdf):
    """Process user query and optional image/PDF."""
    temp_path = "No Image provided by user."

    # Save image if provided
    if input_image is not None:
        temp_path = "/home/shivas/Medchat/temp/uploaded_input_image.png"
        input_bgr = cv2.cvtColor(input_image, cv2.COLOR_RGB2BGR)
        cv2.imwrite(temp_path, input_bgr)

    # Process PDF if provided
    sum_report = None
    if input_pdf is not None:
        report_path = save_uploaded_file(input_file=input_pdf)
        try:
            report = ocr_tool._run(report_path)["extracted_text"]
            prompt = f"{report}\n\nSummarize this report in 50 words."
            summary = model_llm.invoke([HumanMessage(content=prompt)])
            sum_report = summary.content
        except Exception as e:
            sum_report = f"Error summarizing report: {str(e)}"

    # Final user query for the agent
    message_content = f"{input_text}\n\nReport Summary: {sum_report if sum_report else 'None'}"
    print("Final prompt to agent:\n", message_content)

    # Agent invocation
    result = agent_executor.invoke({"messages": [HumanMessage(content=message_content)]}, config)
    print(result)
    outputs = [msg.content for msg in result["messages"]]
    final_output = outputs[-1]

    # Try to extract image path if tool returned JSON/dict string
    image_path = None
    try:
        parsed = json.loads(final_output)
        image_path = parsed.get("image_path")
        final_output = parsed.get("marketing_post", final_output)  # Use cleaned text
    except Exception:
        # fallback if it's not a JSON string
        print("Could not parse tool output as JSON.")

    return final_output, image_path


# Gradio UI
iface = gr.Interface(
    fn=process_query,
    inputs=[
        gr.Textbox(label="Enter your query"),
        gr.Image(label="Upload an image (optional)"),
        gr.File(label="Upload a document (PDF)"),
    ],
    outputs=[
        gr.Textbox(label="Response"),
        gr.Image(label="Processed Image")
    ],
    title="AI Marketing",
    description="Upload a PDF or image, enter a query, and generate intelligent content.",
)

iface.launch(share=True)
