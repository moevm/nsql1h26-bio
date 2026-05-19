from pydantic import BaseModel, ConfigDict, Field
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



class ZoneCreate(Base):
    name: str
    building: str
    type: str


class ZoneUpdate(Base):
    name: Optional[str] = None
    building: Optional[str] = None
    type: Optional[str] = None


class ZoneResponse(Base):
    model_config = {"populate_by_name": True}

    id: str = Field(..., alias="_id")
    name: str
    building: str
    type: str



class DeviceCreate(Base):

    type: str
    zone_id: str
    firmware_version: str

class DeviceUpdate(Base):

    type: Optional[str] = None
    zone_id: Optional[str] = None
    firmware_version: Optional[str] = None

class DeviceResponse(Base):

    model_config = {"populate_by_name": True}
    id: str = Field(..., alias="_id")
    type: str
    zone_id: str
    firmware_version: str


class Schedule(Base):
    days: list[str]
    time_from: str
    time_to: str


class PolicyCreate(Base):
    target_type: str
    target_id: str
    allowed_zone_ids: list[str]
    schedule: Schedule
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None


class PolicyUpdate(Base):
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    allowed_zone_ids: Optional[list[str]] = None
    schedule: Optional[Schedule] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None


class PolicyResponse(Base):
    model_config = {"populate_by_name": True}

    id: str = Field(..., alias="_id")
    target_type: str
    target_id: str
    allowed_zone_ids: list[str]
    schedule: Schedule
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None