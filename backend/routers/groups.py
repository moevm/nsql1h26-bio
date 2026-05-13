from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from database import get_database
from repos import GroupRepository
from schemas import GroupCreate, GroupUpdate, GroupResponse


router = APIRouter(prefix="/groups", tags=["groups"])

async def get_group_repo() -> GroupRepository:
    return GroupRepository(get_database())

@router.get("/", response_model=list[GroupResponse])
async def get_groups(
        name: Optional[str] = None,
        description: Optional[str] = None,
        parent_group_id: Optional[str] = None,
        repo: GroupRepository = Depends(get_group_repo),
):
    return await repo.filter(name=name, description=description, parent_group_id=parent_group_id)

@router.get("/{id}", response_model=GroupResponse)
async def get_group(id: str, repo: GroupRepository = Depends(get_group_repo)):
    data = await repo.find_by_id(id)
    if not data:
        raise HTTPException(status_code=404, detail="Нет такой группы")
    return data

@router.post("/", response_model=GroupResponse)
async def create_group(group: GroupCreate, repo: GroupRepository = Depends(get_group_repo)):
    data = group.model_dump()
    inserted_id = await repo.insert(data)
    return await repo.find_by_id(str(inserted_id))

@router.put("/{id}", response_model=GroupResponse)
async def update_group(id: str, group: GroupUpdate, repo: GroupRepository = Depends(get_group_repo)):
    existing = await repo.find_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Нет такой группы")
    update_data = group.model_dump(exclude_unset=True)
    return await repo.update(id, update_data)

@router.delete("/{id}")
async def delete_group(id: str, repo: GroupRepository = Depends(get_group_repo)):
    existing = await repo.find_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Нет такой группы")
    await repo.delete(id)
    return {"message": "Группа удалена"}