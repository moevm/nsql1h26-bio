from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

from database import get_database
from repos import EventRepository
from schemas import EventResponse


router = APIRouter(prefix="/events", tags=["events"])

async def get_event_repo() -> EventRepository:
    return EventRepository(get_database())


@router.get('/', response_model=list[EventResponse])
async def get_events(
    zone_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    decision: Optional[str] = None,
    repo: EventRepository = Depends(get_event_repo),
):
    return await repo.filter(zone_id=zone_id, date_from=date_from, date_to=date_to, decision=decision)


@router.get('/{id}', response_model=EventResponse)
async def get_event(id: str, repo: EventRepository = Depends(get_event_repo)):
    data = await repo.find_by_id(id)
    if not data:
        raise HTTPException(status_code=404, detail="Нет такого события")
    return data


@router.delete('/{id}')
async def delete_event(id: str, repo: EventRepository = Depends(get_event_repo)):
    existing = await repo.find_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Нет такого события")
    await repo.delete(id)
    return {"message": "Событие удалено"}