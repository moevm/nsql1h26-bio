from fastapi import APIRouter, FastAPI, Depends
from fastapi.responses import RedirectResponse
from services import SkudService

app = FastAPI(title="СКУД ЛЭТИ")

@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")

router = APIRouter(prefix="/api/v1")

# Глобальный контекст для сохранения демо id, только демоверсия
demo_context = {} 

# Функция-провайдер для Dependency Injection
def get_skud_service() -> SkudService:
    raise NotImplementedError("Сервис передаётся снаружи через dependency_overrides в мейне")


@router.post("/init")
def init_test_data(service: SkudService = Depends(get_skud_service)):
    service.clear_all_data()
    # Сохраняем сгенерированные id зон и групп
    context = service.setup_infrastructure()
    demo_context.update(context)
    return {"status": "ok", "message": "БД очищена, зоны и группы созданы"}


@router.post("/people")
def create_person(payload: dict, service: SkudService = Depends(get_skud_service)):
    person_id = service.register_person(
        full_name=payload["full_name"],
        role="student",
        department="ФКТИ",
        group_id=demo_context.get("child_group_id"),
        face_embedding=payload["embedding"]
    )
    demo_context["person_id"] = person_id
    return {"status": "ok", "person_id": str(person_id)}


@router.post("/policies")
def create_policy(service: SkudService = Depends(get_skud_service)):
    policy_id = service.assign_group_policy(
        group_id=demo_context.get("root_group_id"),
        zone_id=demo_context.get("zone_id")
    )
    return {"status": "ok", "policy_id": str(policy_id)}


@router.post("/device/access-attempt")
def attempt_access(service: SkudService = Depends(get_skud_service)):
    event_id = service.log_access(
        person_id=demo_context.get("person_id"),
        device_id=demo_context.get("device_id"),
        zone_id=demo_context.get("zone_id")
    )
    return {"status": "ok", "event_id": str(event_id), "decision": "ALLOW"}

app.include_router(router)
