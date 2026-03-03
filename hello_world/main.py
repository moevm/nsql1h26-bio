from fastapi.testclient import TestClient
from datetime import datetime, timezone, timedelta

from database import get_database
from repos import (
    PersonRepository, EventRepository, GroupRepository, 
    ZoneRepository, DeviceRepository, PolicyRepository
)
from services import SkudService
import api

def main():
    print("=== Старт системы СКУД ===\n")
    
    db = get_database()
    
    repos = {
        'persons': PersonRepository(db),
        'events': EventRepository(db),
        'groups': GroupRepository(db),
        'zones': ZoneRepository(db),
        'devices': DeviceRepository(db),
        'policies': PolicyRepository(db)
    }
    
    # Создаем наш сервис
    skud_service_instance = SkudService(repos)
    
    # Подменяем зависимость (правильный путь вместо глобальной переменной)
    api.app.dependency_overrides[api.get_skud_service] = lambda: skud_service_instance
    
    client = TestClient(api.app)

    print("[GET] / -> Проверка редиректа с корня")
    response = client.get("/", follow_redirects=False)
    print(f"      Статус код: {response.status_code}, Редирект на: {response.headers.get('location')}\n")

    print("[POST] /api/v1/init -> Создание инфраструктуры (Зоны, Группы)")
    res_init = client.post("/api/v1/init")
    print(f"      Ответ API: {res_init.json()['message']}\n")

    print("[POST] /api/v1/people -> Добавление пользователя с биометрией")
    res_person = client.post("/api/v1/people", json={
        "full_name": "Иванов Иван Иванович",
        "embedding": [0.12, -0.33, 0.77, 0.05]
    })
    print(f"      Ответ API: {res_person.json()}\n")

    print("[POST] /api/v1/policies -> Назначение прав доступа на корневую группу")
    res_policy = client.post("/api/v1/policies")
    print(f"      Ответ API: {res_policy.json()}\n")

    print("[POST] /api/v1/device/access-attempt -> Попытка прохода (Логирование)")
    res_event = client.post("/api/v1/device/access-attempt")
    print(f"      Ответ API: {res_event.json()}\n")

    
    print("--- ПРЯМАЯ ПРОВЕРКА БД (штрафы) ---")
    
    print("[БД] Проверка регистронезависимого поиска")
    p_doc = repos['persons'].find_by_name_insensitive("иванов") 
    if p_doc:
        print(f"      Найдено по запросу 'иванов' (в БД 'Иванов...'): {p_doc['full_name']}\n")
    else:
        print("      Документ не найден!\n")

    print("[БД] Проверка поиска по диапазону дат")
    date_from = datetime.now(timezone.utc) - timedelta(minutes=5)
    date_to = datetime.now(timezone.utc) + timedelta(minutes=5)
    events = repos['events'].find_events_in_timerange(date_from, date_to)
    print(f"      Найдено событий за период (от и до): {len(events)}")
    
    print("\n=== Успешно завершено ===")

if __name__ == "__main__":
    main()
