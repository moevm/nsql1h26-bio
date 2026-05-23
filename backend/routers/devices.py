from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from bson import ObjectId

from database import get_database
from repos import DeviceRepository
from schemas.schemas import DeviceCreate, DeviceUpdate, DeviceResponse
from services import get_current_user

router = APIRouter(prefix="/devices", tags=["devices"])


async def get_device_repo() -> DeviceRepository:
    return DeviceRepository(get_database())


@router.get("/", response_model=list[DeviceResponse])
async def get_devices(
    type: Optional[str] = None,
    zone_id: Optional[str] = None,
    firmware_version: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    repo: DeviceRepository = Depends(get_device_repo),
    user: dict = Depends(get_current_user),
):
    return await repo.filter(
        type=type,
        zone_id=zone_id,
        firmware_version=firmware_version,
        skip=skip,
        limit=limit,
    )


@router.get("/{id}", response_model=DeviceResponse)
async def get_device(
    id: str,
    repo: DeviceRepository = Depends(get_device_repo),
    user: dict = Depends(get_current_user),
):
    data = await repo.find_by_id(id)

    if not data:
        raise HTTPException(status_code=404, detail="Нет такого устройства")

    return data


@router.post("/", response_model=DeviceResponse)
async def create_device(
    device: DeviceCreate,
    repo: DeviceRepository = Depends(get_device_repo),
    user: dict = Depends(get_current_user),
):
    data = device.model_dump()
    data["zone_id"] = ObjectId(data["zone_id"])

    inserted_id = await repo.insert(data)

    return await repo.find_by_id(str(inserted_id))


@router.put("/{id}", response_model=DeviceResponse)
async def update_device(
    id: str,
    device: DeviceUpdate,
    repo: DeviceRepository = Depends(get_device_repo),
    user: dict = Depends(get_current_user),
):
    existing = await repo.find_by_id(id)

    if not existing:
        raise HTTPException(status_code=404, detail="Нет такого устройства")

    update_data = device.model_dump(exclude_unset=True)

    if "zone_id" in update_data and update_data["zone_id"] is not None:
        update_data["zone_id"] = ObjectId(update_data["zone_id"])

    return await repo.update(id, update_data)


@router.delete("/{id}")
async def delete_device(
    id: str,
    repo: DeviceRepository = Depends(get_device_repo),
    user: dict = Depends(get_current_user),
):
    existing = await repo.find_by_id(id)

    if not existing:
        raise HTTPException(status_code=404, detail="Нет такого устройства")

    await repo.delete(id)

    return {"message": "Устройство удалено"}
