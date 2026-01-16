import google.generativeai as genai
import base64
import json
from typing import Dict, Any
from ..config import settings

# Configure Gemini
genai.configure(api_key=settings.google_ai_api_key)

# System prompt for face analysis
FACE_ANALYSIS_PROMPT = """You are an expert facial analyst AI assistant for a self-improvement app. 
Analyze the provided facial photo and provide a detailed assessment.

Please analyze the following aspects:

1. **Canthal Tilt**: Assess the angle of the eyes (positive, neutral, or negative canthal tilt)
2. **Facial Symmetry**: Rate the overall symmetry of the face
3. **Jawline Definition**: Evaluate the definition and shape of the jawline
4. **Skin Quality**: Assess skin clarity, texture, and any visible concerns
5. **Overall Aesthetic Score**: Provide a score from 1-100

For each measurement, provide:
- A clear assessment value
- A rating: "good", "average", or "needs_improvement"
- Brief description of what was observed

Also provide:
- 3-5 personalized recommendations for improvement
- 3-5 specific protocols/routines to follow

IMPORTANT: Be constructive and positive in your feedback. Focus on actionable improvements.

Return your analysis in the following JSON format:
{
    "canthalTilt": "positive/neutral/negative",
    "facialSymmetry": "excellent/good/average/below_average",
    "jawlineDefinition": "strong/moderate/needs_work",
    "skinQuality": "excellent/good/average/needs_improvement",
    "overallScore": 75,
    "measurements": [
        {
            "name": "Canthal Tilt",
            "value": "Slight positive tilt",
            "description": "Eyes angle slightly upward from inner to outer corner",
            "rating": "good"
        },
        {
            "name": "Facial Symmetry",
            "value": "85%",
            "description": "Good overall symmetry with minor variations",
            "rating": "good"
        }
    ],
    "recommendations": [
        "Focus on skincare routine with vitamin C serum",
        "Consider jawline exercises (mewing technique)",
        "Maintain consistent sleep schedule for skin health"
    ],
    "protocols": [
        "Morning: Cleanse, Vitamin C, Moisturize, SPF",
        "Evening: Double cleanse, Retinol (3x/week), Hydrating serum",
        "Weekly: Face massage for lymphatic drainage",
        "Daily: 10 minutes of jawline exercises"
    ]
}

Analyze the provided image now:"""


async def analyze_face(image_base64: str) -> Dict[str, Any]:
    """
    Analyze a face image using Google Gemini Vision.
    
    Args:
        image_base64: Base64 encoded image string
        
    Returns:
        Dictionary containing the face analysis results
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Prepare the image
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        
        # Create the image part
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_data
        }
        
        # Generate content
        response = model.generate_content([FACE_ANALYSIS_PROMPT, image_part])
        
        # Parse the response
        response_text = response.text
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                analysis = json.loads(json_str)
                return analysis
        except json.JSONDecodeError:
            pass
        
        # If JSON parsing fails, return a default structure with the raw response
        return {
            "canthalTilt": "analysis_pending",
            "facialSymmetry": "analysis_pending",
            "jawlineDefinition": "analysis_pending",
            "skinQuality": "analysis_pending",
            "overallScore": 0,
            "measurements": [],
            "recommendations": ["Unable to parse detailed analysis. Please try again."],
            "protocols": [],
            "rawResponse": response_text
        }
        
    except Exception as e:
        print(f"Error analyzing face: {str(e)}")
        return {
            "canthalTilt": "error",
            "facialSymmetry": "error",
            "jawlineDefinition": "error",
            "skinQuality": "error",
            "overallScore": 0,
            "measurements": [],
            "recommendations": [f"Analysis error: {str(e)}"],
            "protocols": [],
            "error": str(e)
        }
