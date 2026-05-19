from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from database import get_database
from repos import PersonRepository
from schemas import PersonCreate, PersonUpdate, PersonResponse, RoleEnum, StatusEnum
from services import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/people", tags=["people"])

async def get_person_repo() -> PersonRepository:
    return PersonRepository(get_database())

@router.get("/", response_model=list[PersonResponse])
async def get_people(
        full_name: Optional[str] = None,
        role: Optional[RoleEnum] = None,
        department: Optional[str] = None,
        status: Optional[StatusEnum] = None,
        skip: int = 0,
        limit: int = 100,
        repo: PersonRepository = Depends(get_person_repo),
        current_user: str = Depends(get_current_user)
    ):
    return await repo.filter(
        full_name=full_name,
        role=role,
        department=department,
        status=status,
        skip=skip,
        limit=limit,
    )

@router.get("/{id}", response_model=PersonResponse)
async def get_person(
    id: str,
    repo: PersonRepository = Depends(get_person_repo),
    current_user: str = Depends(get_current_user)
):
    data = await repo.find_by_id(id)
    if not data:
        raise HTTPException(status_code=404, detail="Нет такого человека")
    return data

@router.post("/", response_model=PersonResponse)
async def create_person(
    person: PersonCreate,
    repo: PersonRepository = Depends(get_person_repo),
    current_user: str = Depends(get_current_user)
):
    data = person.model_dump()

    if "group_ids" in data and data["group_ids"] is not None:
        data["group_ids"] = [ObjectId(group_id) for group_id in data["group_ids"]]

    data["biometrics"] = []
    data["created_at"] = datetime.now()
    data["updated_at"] = datetime.now()

    inserted_id = await repo.insert(data)
    return await repo.find_by_id(str(inserted_id))

@router.put("/{id}", response_model=PersonResponse)
async def update_person(
    id: str,
    person: PersonUpdate,
    repo: PersonRepository = Depends(get_person_repo),
    current_user: str = Depends(get_current_user)
):
    existing = await repo.find_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Нет такого человека")
    update_data = person.model_dump(exclude_unset=True)

    if "group_ids" in update_data and update_data["group_ids"] is not None:
        update_data["group_ids"] = [ObjectId(group_id) for group_id in update_data["group_ids"]]

    update_data["updated_at"] = datetime.now()

    updated = await repo.update(id, update_data)

    if not updated:
        raise HTTPException(status_code=404, detail="Нет такого человека")

    return updated

@router.delete("/{id}")
async def delete_person(
    id: str,
    repo: PersonRepository = Depends(get_person_repo),
    current_user: str = Depends(get_current_user)
):
    existing = await repo.find_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Нет такого человека")
    await repo.delete(id)
    return {"message": "Человек удален"}