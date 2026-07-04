import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
print(f"API Key starting with: {api_key[:10]}..." if api_key else "No API Key found")

genai.configure(api_key=api_key)

try:
    print("\nListing available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name} ({m.display_name})")
except Exception as e:
    print(f"Error listing models: {str(e)}")
