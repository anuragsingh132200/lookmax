import google.generativeai as genai
import json
import base64
from ..config import settings

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)

FACE_ANALYSIS_PROMPT = """You are an expert facial analysis AI assistant for a lookmaxxing/self-improvement app. 
Analyze the provided face image and provide detailed, constructive feedback.

IMPORTANT GUIDELINES:
1. Be encouraging and positive while remaining honest
2. Focus on actionable improvements
3. Never be harsh or demeaning
4. Consider multiple aspects: bone structure, skin, symmetry, grooming, etc.
5. Be specific with recommendations that are achievable

ANALYSIS CATEGORIES:
1. **Overall Harmony** (1-10): Face proportions, balance, and overall aesthetic appeal
2. **Skin Quality** (1-10): Clarity, tone uniformity, texture, hydration appearance
3. **Bone Structure** (1-10): Jawline definition, cheekbone prominence, facial thirds proportion
4. **Symmetry** (1-10): Left/right facial balance, eye alignment, feature positioning
5. **Grooming & Styling** (1-10): Current presentation, hair, eyebrows, facial hair if applicable

For each category provide:
- Score (1-10, where 5 is average, 7+ is above average)
- Brief observation (what you notice about this feature)
- 2-3 specific, achievable recommendations

SCORING GUIDELINES:
- 1-3: Below average, significant room for improvement
- 4-5: Average, typical range
- 6-7: Above average, good features
- 8-9: Excellent, standout features
- 10: Exceptional, model-tier

OUTPUT FORMAT (respond ONLY with valid JSON, no markdown):
{
  "overallScore": <number between 1-10>,
  "summary": "<2-3 sentence positive summary highlighting strengths>",
  "categories": [
    {
      "name": "<category name>",
      "score": <number between 1-10>,
      "observation": "<what you notice, 1-2 sentences>",
      "recommendations": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"]
    }
  ],
  "topPriorities": ["<most impactful improvement>", "<second most impactful>", "<third most impactful>"]
}

Analyze the face in the image now and respond with ONLY the JSON object."""


async def analyze_face(image_base64: str) -> dict:
    """
    Analyze a face image using Gemini Flash API.
    
    Args:
        image_base64: Base64 encoded image string
        
    Returns:
        dict: Analysis results with scores and recommendations
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Prepare the image
        image_data = base64.b64decode(image_base64)
        
        # Create the content with image
        response = model.generate_content([
            FACE_ANALYSIS_PROMPT,
            {
                "mime_type": "image/jpeg",
                "data": image_base64
            }
        ])
        
        # Parse the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])
        
        # Parse JSON
        analysis = json.loads(response_text)
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"Failed to parse AI response: {str(e)}",
            "analysis": get_default_analysis()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "analysis": get_default_analysis()
        }


def get_default_analysis() -> dict:
    """Return a default analysis structure when AI fails."""
    return {
        "overallScore": 7.0,
        "summary": "We're having trouble analyzing your image right now. Please try again with better lighting and a clear frontal face photo.",
        "categories": [
            {
                "name": "Overall Harmony",
                "score": 7.0,
                "observation": "Unable to fully analyze due to image quality.",
                "recommendations": ["Try again with better lighting", "Ensure face is clearly visible", "Use a frontal angle"]
            },
            {
                "name": "Skin Quality",
                "score": 7.0,
                "observation": "Unable to assess skin quality from current image.",
                "recommendations": ["Retake photo in natural lighting", "Remove any filters", "Ensure camera focus is sharp"]
            },
            {
                "name": "Bone Structure",
                "score": 7.0,
                "observation": "Bone structure analysis requires clearer image.",
                "recommendations": ["Take photo from front angle", "Keep chin level", "Avoid shadows on face"]
            },
            {
                "name": "Symmetry",
                "score": 7.0,
                "observation": "Symmetry analysis pending better image.",
                "recommendations": ["Center your face in frame", "Look directly at camera", "Keep expression neutral"]
            },
            {
                "name": "Grooming & Styling",
                "score": 7.0,
                "observation": "Grooming assessment requires clearer visibility.",
                "recommendations": ["Style hair as you normally would", "Ensure good visibility", "Natural presentation works best"]
            }
        ],
        "topPriorities": [
            "Retake photo with better lighting",
            "Ensure face is clearly visible and centered",
            "Use front-facing camera angle"
        ]
    }
