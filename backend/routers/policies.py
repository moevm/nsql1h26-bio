from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import get_database
from repos import PolicyRepository
from schemas import PolicyCreate, PolicyUpdate, PolicyResponse
from services import get_current_user


router = APIRouter(prefix="/policies", tags=["policies"])


async def get_policy_repo() -> PolicyRepository:
    return PolicyRepository(get_database())


@router.get("/", response_model=list[PolicyResponse])
async def get_policies(
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    zone_id: Optional[str] = None,
    valid_from: Optional[datetime] = None,
    valid_to: Optional[datetime] = None,
    repo: PolicyRepository = Depends(get_policy_repo),
    current_user: str = Depends(get_current_user),
):
    return await repo.filter(
        target_type=target_type,
        target_id=target_id,
        zone_id=zone_id,
        valid_from=valid_from,
        valid_to=valid_to,
    )


@router.get("/{id}", response_model=PolicyResponse)
async def get_policy(
    id: str,
    repo: PolicyRepository = Depends(get_policy_repo),
    current_user: str = Depends(get_current_user),
):
    data = await repo.find_by_id(id)

    if not data:
        raise HTTPException(status_code=404, detail="Нет такой политики доступа")

    return data


@router.post("/", response_model=PolicyResponse)
async def create_policy(
    policy: PolicyCreate,
    repo: PolicyRepository = Depends(get_policy_repo),
    current_user: str = Depends(get_current_user),
):
    data = policy.model_dump()

    data["target_id"] = ObjectId(data["target_id"])
    data["allowed_zone_ids"] = [
        ObjectId(zone_id)
        for zone_id in data["allowed_zone_ids"]
    ]

    inserted_id = await repo.insert(data)

    return await repo.find_by_id(str(inserted_id))


@router.put("/{id}", response_model=PolicyResponse)
async def update_policy(
    id: str,
    policy: PolicyUpdate,
    repo: PolicyRepository = Depends(get_policy_repo),
    current_user: str = Depends(get_current_user),
):
    existing = await repo.find_by_id(id)

    if not existing:
        raise HTTPException(status_code=404, detail="Нет такой политики доступа")

    update_data = policy.model_dump(exclude_unset=True)

    if "target_id" in update_data and update_data["target_id"] is not None:
        update_data["target_id"] = ObjectId(update_data["target_id"])

    if "allowed_zone_ids" in update_data and update_data["allowed_zone_ids"] is not None:
        update_data["allowed_zone_ids"] = [
            ObjectId(zone_id)
            for zone_id in update_data["allowed_zone_ids"]
        ]

    return await repo.update(id, update_data)


@router.delete("/{id}")
async def delete_policy(
    id: str,
    repo: PolicyRepository = Depends(get_policy_repo),
    current_user: str = Depends(get_current_user),
):
    existing = await repo.find_by_id(id)

    if not existing:
        raise HTTPException(status_code=404, detail="Нет такой политики доступа")

    await repo.delete(id)

    return {"message": "Политика доступа удалена"}