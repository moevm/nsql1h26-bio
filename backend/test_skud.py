import asyncio
from fastapi.testclient import TestClient
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from database import get_database
from repos import (
    PersonRepository,
    EventRepository,
    GroupRepository,
    ZoneRepository,
    DeviceRepository,
    PolicyRepository,
)
from services import SkudService
import api

client = TestClient(api.app)


async def run_db_checks(repos):
    print("\n--- ПРЯМАЯ ПРОВЕРКА БД ---")

    print("[БД] Проверка регистронезависимого поиска (filter)")
    results = await repos["persons"].filter(full_name="иванов")
    if results:
        print(f"      Найдено по запросу 'иванов': {results[0]['full_name']}")
    else:
        print("      Документ не найден!")

    print("[БД] Проверка поиска событий по диапазону дат")
    date_from = datetime.now(timezone.utc) - timedelta(minutes=60)
    date_to = datetime.now(timezone.utc) + timedelta(minutes=60)

    events = await repos["events"].filter(date_from=date_from, date_to=date_to)
    print(f"      Найдено событий за период: {len(events)}")


def test_api():
    """Блок проверки через HTTP запросы"""
    print("=== Старт тестирования API ===\n")

    print("[GET] / -> Проверка редиректа")
    response = client.get("/", follow_redirects=False)
    print(f"      Статус: {response.status_code}\n")

    print("[GET] /api/v1/people -> Получение списка (проверка сидирования)")
    res_people = client.get("/api/v1/people")
    if res_people.status_code == 200:
        print(f"      Людей в базе: {len(res_people.json())}")

    print("\n[POST] /api/v1/auth/login -> Проверка входа")
    login_data = {"username": "admin", "password": "admin123"}
    res_auth = client.post("/api/v1/auth/login", data=login_data)

    if res_auth.status_code == 200:
        token = res_auth.json()["access_token"]
        print(f"      Токен получен: {token[:20]}...")

        headers = {"Authorization": f"Bearer {token}"}
        res_me = client.get("/api/v1/auth/me", headers=headers)
        print(f"      Проверка /me: {res_me.json()['full_name']}")
    else:
        print(f"      Ошибка авторизации: {res_auth.text}")


async def main():
    test_api()

    db = get_database()
    repos = {
        "persons": PersonRepository(db),
        "events": EventRepository(db),
        "groups": GroupRepository(db),
        "zones": ZoneRepository(db),
        "devices": DeviceRepository(db),
        "policies": PolicyRepository(db),
    }
    await run_db_checks(repos)

    print("\n=== Тестирование успешно завершено ===")


if __name__ == "__main__":
    asyncio.run(main())
