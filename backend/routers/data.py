from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from database import get_database
from services import get_current_user
import json

router = APIRouter(tags=["data"])


COLLECTIONS = [
    "users",
    "persons",
    "groups",
    "zones",
    "devices",
    "access_policies",
    "access_events",
]


OBJECT_ID_FIELDS = {
    "_id",
    "person_id",
    "device_id",
    "zone_id",
    "parent_group_id",
    "target_id",
}

OBJECT_ID_LIST_FIELDS = {
    "group_ids",
    "allowed_zone_ids",
}

DATETIME_FIELDS = {
    "created_at",
    "updated_at",
    "timestamp",
    "valid_from",
    "valid_to",
}


def serialize_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, list):
        return [serialize_value(item) for item in value]

    if isinstance(value, dict):
        return {key: serialize_value(val) for key, val in value.items()}

    return value


def parse_object_id(value: Any) -> Any:
    if isinstance(value, str) and ObjectId.is_valid(value):
        return ObjectId(value)

    return value


def parse_datetime(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return value


def deserialize_document(document: dict[str, Any]) -> dict[str, Any]:
    result = {}

    for key, value in document.items():
        if key in OBJECT_ID_FIELDS:
            result[key] = parse_object_id(value)

        elif key in OBJECT_ID_LIST_FIELDS and isinstance(value, list):
            result[key] = [parse_object_id(item) for item in value]

        elif key in DATETIME_FIELDS:
            result[key] = parse_datetime(value)

        elif isinstance(value, dict):
            result[key] = deserialize_document(value)

        elif isinstance(value, list):
            result[key] = [
                deserialize_document(item) if isinstance(item, dict) else item
                for item in value
            ]

        else:
            result[key] = value

    return result


@router.get("/export")
async def export_data(
    current_user: str = Depends(get_current_user),
):
    db = get_database()
    result = {}

    for collection_name in COLLECTIONS:
        cursor = db[collection_name].find({})
        documents = await cursor.to_list(length=None)

        result[collection_name] = [
            serialize_value(document)
            for document in documents
        ]

    return JSONResponse(
        content=result,
        headers={
            "Content-Disposition": "attachment; filename=skud_export.json"
        },
    )


@router.post("/import")
async def import_data(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    db = get_database()

    if not file.filename.endswith(".json"):
        raise HTTPException(
            status_code=400,
            detail="Файл должен быть в формате JSON",
        )

    try:
        content = await file.read()
        payload = json.loads(content.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Некорректный JSON-файл",
        )

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=400,
            detail="JSON должен быть объектом с коллекциями",
        )

    payload_collections = set(payload.keys())
    expected_collections = set(COLLECTIONS)

    unknown_collections = payload_collections - expected_collections
    missing_collections = expected_collections - payload_collections

    if unknown_collections:
        raise HTTPException(
            status_code=400,
            detail=f"Неизвестные коллекции: {', '.join(sorted(unknown_collections))}",
        )

    if missing_collections:
        raise HTTPException(
            status_code=400,
            detail=f"Отсутствуют коллекции: {', '.join(sorted(missing_collections))}",
        )

    for collection_name, documents in payload.items():
        if not isinstance(documents, list):
            raise HTTPException(
                status_code=400,
                detail=f"Коллекция {collection_name} должна быть списком документов",
            )

        for document in documents:
            if not isinstance(document, dict):
                raise HTTPException(
                    status_code=400,
                    detail=f"Все элементы коллекции {collection_name} должны быть объектами",
                )

    for collection_name in COLLECTIONS:
        await db[collection_name].delete_many({})

    for collection_name in COLLECTIONS:
        documents = payload[collection_name]

        if documents:
            prepared_documents = [
                deserialize_document(document)
                for document in documents
            ]

            await db[collection_name].insert_many(prepared_documents)

    return {"message": "Данные импортированы"}