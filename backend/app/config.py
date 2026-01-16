from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # MongoDB
    mongodb_uri: str = "mongodb://admin:password123@localhost:27017/lookmax?authSource=admin"
    
    # JWT
    jwt_secret: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Google AI (Gemini)
    google_ai_api_key: str = ""
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_WEEKLY: str = ""
    STRIPE_PRICE_MONTHLY: str = ""
    STRIPE_PRICE_YEARLY: str = ""
    
    # App URL for redirects
    APP_URL: str = "lookmax://"
    
    # CORS
    cors_origins: str = '["http://localhost:19006","http://localhost:8082","http://localhost:5173","http://localhost:3000"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.cors_origins)
        except json.JSONDecodeError:
            return ["http://localhost:19006", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
