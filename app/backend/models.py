from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=16, max_length=128)
    password: str = Field(min_length=8, max_length=128)


class CartItemIn(BaseModel):
    slug: str = Field(min_length=2, max_length=80)
    tier: str = Field(pattern="^(standard|enterprise)$")


class CheckoutIn(BaseModel):
    items: List[CartItemIn] = Field(min_length=1, max_length=12)
    promo_code: Optional[str] = Field(default=None, max_length=40)
    origin_url: str = Field(min_length=8, max_length=200)


class PromoIn(BaseModel):
    code: str = Field(min_length=2, max_length=40)

    
class SupportIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=120)
    message: str = Field(min_length=10, max_length=4000)
