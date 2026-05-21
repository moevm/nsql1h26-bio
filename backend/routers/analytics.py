from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import get_database
from services import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


ALLOWED_AXES = {
    "decision": "$decision",
    "reason": "$reason",
    "auth_method": "$auth_method",
    "zone_name": "$zone.name",
    "zone_building": "$zone.building",
    "zone_type": "$zone.type",
    "device_type": "$device.type",
    "device_firmware_version": "$device.firmware_version",
    "person_role": "$person.role",
    "person_department": "$person.department",
    "person_status": "$person.status",
}


@router.get("/")
async def get_analytics(
    x_axis: str,
    y_axis: str,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    person_id: Optional[str] = None,
    zone_id: Optional[str] = None,
    device_id: Optional[str] = None,
    auth_method: Optional[str] = None,
    decision: Optional[str] = None,
    reason: Optional[str] = None,
    recognition_score_from: Optional[float] = None,
    recognition_score_to: Optional[float] = None,
    person_role: Optional[str] = None,
    person_department: Optional[str] = None,
    person_status: Optional[str] = None,
    zone_name: Optional[str] = None,
    zone_building: Optional[str] = None,
    zone_type: Optional[str] = None,
    device_type: Optional[str] = None,
    device_firmware_version: Optional[str] = None,
    current_user: str = Depends(get_current_user),
):
    if x_axis not in ALLOWED_AXES:
        raise HTTPException(status_code=400, detail="Недопустимое поле для оси X")

    if y_axis not in ALLOWED_AXES:
        raise HTTPException(status_code=400, detail="Недопустимое поле для оси Y")

    db = get_database()

    event_match = {}

    if date_from or date_to:
        event_match["timestamp"] = {}

        if date_from:
            event_match["timestamp"]["$gte"] = date_from

        if date_to:
            event_match["timestamp"]["$lte"] = date_to

    if person_id:
        event_match["person_id"] = ObjectId(person_id)

    if zone_id:
        event_match["zone_id"] = ObjectId(zone_id)

    if device_id:
        event_match["device_id"] = ObjectId(device_id)

    if auth_method:
        event_match["auth_method"] = {"$regex": auth_method, "$options": "i"}

    if decision:
        event_match["decision"] = {"$regex": decision, "$options": "i"}

    if reason:
        event_match["reason"] = {"$regex": reason, "$options": "i"}

    if recognition_score_from is not None or recognition_score_to is not None:
        event_match["recognition_score"] = {}

        if recognition_score_from is not None:
            event_match["recognition_score"]["$gte"] = recognition_score_from

        if recognition_score_to is not None:
            event_match["recognition_score"]["$lte"] = recognition_score_to

    joined_match = {}

    if person_role:
        joined_match["person.role"] = {"$regex": person_role, "$options": "i"}

    if person_department:
        joined_match["person.department"] = {
            "$regex": person_department,
            "$options": "i",
        }

    if person_status:
        joined_match["person.status"] = {"$regex": person_status, "$options": "i"}

    if zone_name:
        joined_match["zone.name"] = {"$regex": zone_name, "$options": "i"}

    if zone_building:
        joined_match["zone.building"] = {"$regex": zone_building, "$options": "i"}

    if zone_type:
        joined_match["zone.type"] = {"$regex": zone_type, "$options": "i"}

    if device_type:
        joined_match["device.type"] = {"$regex": device_type, "$options": "i"}

    if device_firmware_version:
        joined_match["device.firmware_version"] = {
            "$regex": device_firmware_version,
            "$options": "i",
        }

    pipeline = []

    if event_match:
        pipeline.append({"$match": event_match})

    pipeline.extend(
        [
            {
                "$lookup": {
                    "from": "persons",
                    "localField": "person_id",
                    "foreignField": "_id",
                    "as": "person",
                }
            },
            {
                "$unwind": {
                    "path": "$person",
                    "preserveNullAndEmptyArrays": True,
                }
            },
            {
                "$lookup": {
                    "from": "zones",
                    "localField": "zone_id",
                    "foreignField": "_id",
                    "as": "zone",
                }
            },
            {
                "$unwind": {
                    "path": "$zone",
                    "preserveNullAndEmptyArrays": True,
                }
            },
            {
                "$lookup": {
                    "from": "devices",
                    "localField": "device_id",
                    "foreignField": "_id",
                    "as": "device",
                }
            },
            {
                "$unwind": {
                    "path": "$device",
                    "preserveNullAndEmptyArrays": True,
                }
            },
        ]
    )

    if joined_match:
        pipeline.append({"$match": joined_match})

    pipeline.extend(
        [
            {
                "$group": {
                    "_id": {
                        "x": ALLOWED_AXES[x_axis],
                        "y": ALLOWED_AXES[y_axis],
                    },
                    "count": {"$sum": 1},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "x": "$_id.x",
                    "y": "$_id.y",
                    "count": 1,
                }
            },
            {
                "$sort": {
                    "x": 1,
                    "y": 1,
                }
            },
        ]
    )

    cursor = db.access_events.aggregate(pipeline)
    result = await cursor.to_list(length=None)

    return result
