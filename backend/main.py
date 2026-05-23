import uvicorn
from contextlib import asynccontextmanager
from api import app
from database import get_database
from services import SkudService
from repos import (
    PersonRepository,
    EventRepository,
    GroupRepository,
    ZoneRepository,
    DeviceRepository,
    PolicyRepository,
)


@asynccontextmanager
async def lifespan(app):
    db = get_database()

    repos = {
        "persons": PersonRepository(db),
        "events": EventRepository(db),
        "groups": GroupRepository(db),
        "zones": ZoneRepository(db),
        "devices": DeviceRepository(db),
        "policies": PolicyRepository(db),
    }

    service = SkudService(repos)
    await service.seed_database()

    print("=== Сервер СКУД ЛЭТИ запущен и база инициализирована ===")
    yield
    print("=== Сервер СКУД ЛЭТИ остановлен ===")


app.router.lifespan_context = lifespan

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
