from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    student = "student"
    staff = "staff"
    guest = "guest"


class StatusEnum(str, Enum):
    active = "active"
    blocked = "blocked"


class Base(BaseModel):
    pass


class PersonCreate(Base):
    full_name: str
    role: RoleEnum
    department: str
    status: StatusEnum = StatusEnum.active
    group_ids: Optional[list[str]] = []


class PersonUpdate(Base):
    full_name: Optional[str] = None
    role: Optional[RoleEnum] = None
    department: Optional[str] = None
    status: Optional[StatusEnum] = None
    group_ids: Optional[list[str]] = None


class PersonResponse(Base):

    model_config = {"populate_by_name": True}

    id: str = Field(..., alias="_id")
    full_name: str
    role: RoleEnum
    department: str
    status: StatusEnum
    group_ids: Optional[list[str]] = []
    created_at: datetime
    updated_at: datetime


class EventResponse(Base):

    model_config = {"populate_by_name": True}
    id: str = Field(..., alias="_id")
    timestamp: datetime
    person_id: str
    device_id: str
    zone_id: str
    auth_method: str
    decision: str
    reason: Optional[str] = None
    recognition_score: float


class GroupCreate(Base):
    name: str
    parent_group_id: Optional[str] = None
    description: Optional[str] = None


class GroupUpdate(Base):
    name: Optional[str] = None
    parent_group_id: Optional[str] = None
    description: Optional[str] = None


class GroupResponse(Base):
    model_config = {"populate_by_name": True}
    id: str = Field(..., alias="_id")
    name: str
    parent_group_id: Optional[str] = None
    description: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserMe(BaseModel):
    username: str
    role: str
    full_name: str