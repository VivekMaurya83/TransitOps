"""
Company + user profile settings schemas.
"""
from typing import Optional
from pydantic import BaseModel

class SettingsOut(BaseModel):
    full_name: str
    email: str
    company_name: str
    company_location: Optional[str] = None
    role: str

class UpdateSettingsRequest(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_location: Optional[str] = None