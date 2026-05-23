from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from database import get_database
from repos import ZoneRepository
from schemas.schemas import ZoneCreate, ZoneUpdate, ZoneResponse
from services import get_current_user

router = APIRouter(prefix="/zones", tags=["zones"])


async def get_zone_repo() -> ZoneRepository:
    return ZoneRepository(get_database())


@router.get("/", response_model=list[ZoneResponse])
async def get_zones(
    name: Optional[str] = None,
    building: Optional[str] = None,
    type: Optional[str] = None,
    repo: ZoneRepository = Depends(get_zone_repo),
    skip: int = 0,
    limit: int = 100,
    user: dict = Depends(get_current_user),
):
    return await repo.filter(
        name=name,
        building=building,
        type=type,
        skip=skip,
        limit=limit,
    )


@router.get("/{id}", response_model=ZoneResponse)
async def get_zone(
    id: str,
    repo: ZoneRepository = Depends(get_zone_repo),
    user: dict = Depends(get_current_user),
):
    data = await repo.find_by_id(id)

    if not data:
        raise HTTPException(status_code=404, detail="Нет такой зоны")

    return data


@router.post("/", response_model=ZoneResponse)
async def create_zone(
    zone: ZoneCreate,
    repo: ZoneRepository = Depends(get_zone_repo),
    user: dict = Depends(get_current_user),
):
    data = zone.model_dump()
    inserted_id = await repo.insert(data)

    return await repo.find_by_id(str(inserted_id))


@router.put("/{id}", response_model=ZoneResponse)
async def update_zone(
    id: str,
    zone: ZoneUpdate,
    repo: ZoneRepository = Depends(get_zone_repo),
    user: dict = Depends(get_current_user),
):
    existing = await repo.find_by_id(id)

    if not existing:
        raise HTTPException(status_code=404, detail="Нет такой зоны")

    update_data = zone.model_dump(exclude_unset=True)

    return await repo.update(id, update_data)


@router.delete("/{id}")
async def delete_zone(
    id: str,
    repo: ZoneRepository = Depends(get_zone_repo),
    user: dict = Depends(get_current_user),
):
    existing = await repo.find_by_id(id)

    if not existing:
        raise HTTPException(status_code=404, detail="Нет такой зоны")

    await repo.delete(id)

    return {"message": "Зона удалена"}
