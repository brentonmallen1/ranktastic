from pydantic import BaseModel, EmailStr


class SubscribeRequest(BaseModel):
    poll_id: str
    email: EmailStr


class SubscribeResponse(BaseModel):
    message: str
