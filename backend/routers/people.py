from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from database import get_database
from repos import PersonRepository
from schemas import PersonCreate, PersonUpdate, PersonResponse, RoleEnum, StatusEnum
from services import get_current_user

router = APIRouter(prefix="/people", tags=["people"])

async def get_person_repo() -> PersonRepository:
    return PersonRepository(get_database())

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

@router.get("/", response_model=list[PersonResponse])
async def get_people(
    full_name: Optional[str] = None,
    role: Optional[RoleEnum] = None,
    department: Optional[str] = None,
    status: Optional[StatusEnum] = None,
    repo: PersonRepository = Depends(get_person_repo),
    current_user: str = Depends(get_current_user)
):
    return await repo.filter(full_name=full_name, role=role, department=department, status=status)

@router.post("/", response_model=PersonResponse)
async def create_person(
    person: PersonCreate,
    repo: PersonRepository = Depends(get_person_repo),
    current_user: str = Depends(get_current_user)
):
    data = person.model_dump()
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
    update_data["updated_at"] = datetime.now()
    return await repo.update(id, update_data)

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