import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi import HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from database import get_database

if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-for-prototype")
ALGORITHM = "HS256"


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Неверный токен")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")


class SkudService:
    def __init__(self, repos: dict):
        self.repos = repos

    async def clear_all_data(self):
        for repo in self.repos.values():
            await repo.drop_collection()

    async def seed_database(self):
        db = get_database()

        admin_exists = await db.users.find_one({"username": "admin"})
        if admin_exists:
            print("[SEED] База уже инициализирована.")
            return

        print("[SEED] Инициализация тестовых данных...")

        await db.users.insert_many(
            [
                {
                    "username": "admin",
                    "password": get_password_hash("admin123"),
                    "role": "admin",
                    "full_name": "Администратор Системы",
                },
                {
                    "username": "guard",
                    "password": get_password_hash("guard123"),
                    "role": "guard",
                    "full_name": "Охранник Иванов",
                },
            ]
        )

        g_students = await self.repos["groups"].insert(
            {
                "name": "Студенты",
                "parent_group_id": None,
                "description": "Все студенты университета",
            }
        )
        g_1k = await self.repos["groups"].insert(
            {
                "name": "1 курс",
                "parent_group_id": g_students,
                "description": "Студенты 1 курса",
            }
        )
        g_2k = await self.repos["groups"].insert(
            {
                "name": "2 курс",
                "parent_group_id": g_students,
                "description": "Студенты 2 курса",
            }
        )
        g_staff = await self.repos["groups"].insert(
            {
                "name": "Сотрудники",
                "parent_group_id": None,
                "description": "Все сотрудники",
            }
        )
        g_teachers = await self.repos["groups"].insert(
            {
                "name": "Преподаватели",
                "parent_group_id": g_staff,
                "description": "Преподавательский состав",
            }
        )
        g_security = await self.repos["groups"].insert(
            {
                "name": "Охрана",
                "parent_group_id": g_staff,
                "description": "Служба безопасности",
            }
        )

        z_main = await self.repos["zones"].insert(
            {"name": "Главный вход", "building": "Корпус 1", "type": "entrance"}
        )
        z_lab3 = await self.repos["zones"].insert(
            {"name": "Лаборатория 3", "building": "Корпус 5", "type": "laboratory"}
        )
        z_lab5 = await self.repos["zones"].insert(
            {"name": "Лаборатория 5", "building": "Корпус 5", "type": "laboratory"}
        )
        z_server = await self.repos["zones"].insert(
            {"name": "Серверная", "building": "Корпус 1", "type": "restricted"}
        )
        z_library = await self.repos["zones"].insert(
            {"name": "Библиотека", "building": "Корпус 2", "type": "library"}
        )
        z_gym = await self.repos["zones"].insert(
            {"name": "Спортзал", "building": "Корпус 3", "type": "sports"}
        )

        d_main = await self.repos["devices"].insert(
            {
                "name": "Турникет-1",
                "type": "turnstile",
                "zone_id": z_main,
                "firmware_version": "2.1.0",
            }
        )
        d_lab3 = await self.repos["devices"].insert(
            {
                "name": "Терминал Лаб-3",
                "type": "terminal",
                "zone_id": z_lab3,
                "firmware_version": "1.0.3",
            }
        )
        d_lab5 = await self.repos["devices"].insert(
            {
                "name": "Терминал Лаб-5",
                "type": "terminal",
                "zone_id": z_lab5,
                "firmware_version": "1.0.3",
            }
        )
        d_server = await self.repos["devices"].insert(
            {
                "name": "Замок Серверной",
                "type": "door_lock",
                "zone_id": z_server,
                "firmware_version": "3.0.1",
            }
        )
        d_library = await self.repos["devices"].insert(
            {
                "name": "Турникет Библиотека",
                "type": "turnstile",
                "zone_id": z_library,
                "firmware_version": "2.0.5",
            }
        )

        now = datetime.now(timezone.utc)

        def make_person(full_name, role, department, group_id, status="active"):
            return {
                "full_name": full_name,
                "role": role,
                "department": department,
                "status": status,
                "group_ids": [group_id],
                "biometrics": [],
                "created_at": now,
                "updated_at": now,
            }

        p1 = await self.repos["persons"].insert(
            make_person("Иванов Иван Иванович", "student", "ФКТИ", g_1k)
        )
        p2 = await self.repos["persons"].insert(
            make_person("Петрова Анна Сергеевна", "student", "ФКТИ", g_1k)
        )
        p3 = await self.repos["persons"].insert(
            make_person("Сидоров Петр Кузьмич", "student", "ФЭА", g_2k)
        )
        p4 = await self.repos["persons"].insert(
            make_person("Козлова Елена Николаевна", "student", "ФЭА", g_2k)
        )
        p5 = await self.repos["persons"].insert(
            make_person("Новиков Алексей Дмитриевич", "student", "ФКТИ", g_1k)
        )
        p6 = await self.repos["persons"].insert(
            make_person(
                "Морозов Дмитрий Александрович", "staff", "Кафедра ВТ", g_teachers
            )
        )
        p7 = await self.repos["persons"].insert(
            make_person("Волкова Мария Павловна", "staff", "Кафедра ФМ", g_teachers)
        )
        p8 = await self.repos["persons"].insert(
            make_person(
                "Зайцев Андрей Викторович", "staff", "Служба безопасности", g_security
            )
        )
        p9 = await self.repos["persons"].insert(
            make_person("Лебедева Ольга Игоревна", "guest", "Внешний гость", g_students)
        )
        p10 = await self.repos["persons"].insert(
            make_person(
                "Блокированный Тест Тестович", "student", "ФКТИ", g_1k, status="blocked"
            )
        )

        await self.repos["policies"].insert(
            {
                "target_type": "group",
                "target_id": g_students,
                "allowed_zone_ids": [z_main, z_library, z_gym],
                "schedule": {
                    "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    "time_from": "08:00",
                    "time_to": "20:00",
                },
                "valid_from": now,
                "valid_to": None,
            }
        )
        await self.repos["policies"].insert(
            {
                "target_type": "group",
                "target_id": g_teachers,
                "allowed_zone_ids": [z_main, z_lab3, z_lab5, z_library],
                "schedule": {
                    "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
                    "time_from": "07:00",
                    "time_to": "22:00",
                },
                "valid_from": now,
                "valid_to": None,
            }
        )
        await self.repos["policies"].insert(
            {
                "target_type": "group",
                "target_id": g_security,
                "allowed_zone_ids": [z_main, z_server, z_lab3, z_lab5],
                "schedule": {
                    "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    "time_from": "00:00",
                    "time_to": "23:59",
                },
                "valid_from": now,
                "valid_to": None,
            }
        )

        def make_event(
            person_id,
            device_id,
            zone_id,
            decision,
            method,
            minutes_ago,
            score,
            reason=None,
        ):
            return {
                "timestamp": datetime.now(timezone.utc)
                - timedelta(minutes=minutes_ago),
                "person_id": person_id,
                "device_id": device_id,
                "zone_id": zone_id,
                "auth_method": method,
                "decision": decision,
                "reason": reason or ("OK" if decision == "ALLOW" else "Access Denied"),
                "recognition_score": score,
            }

        events = [
            make_event(p1, d_main, z_main, "ALLOW", "face", 5, 0.97),
            make_event(p2, d_main, z_main, "ALLOW", "face", 12, 0.93),
            make_event(p3, d_lab3, z_lab3, "DENY", "face", 20, 0.41, "Low score"),
            make_event(p4, d_library, z_library, "ALLOW", "voice", 35, 0.88),
            make_event(p5, d_main, z_main, "ALLOW", "face", 50, 0.95),
            make_event(p6, d_lab3, z_lab3, "ALLOW", "face", 65, 0.99),
            make_event(p7, d_lab5, z_lab5, "ALLOW", "voice", 80, 0.91),
            make_event(p8, d_server, z_server, "ALLOW", "face", 95, 0.96),
            make_event(p9, d_main, z_main, "DENY", "card", 110, 0.30, "Unknown person"),
            make_event(
                p1, d_lab3, z_lab3, "DENY", "face", 125, 0.38, "Access policy violation"
            ),
            make_event(
                p6, d_server, z_server, "DENY", "face", 140, 0.55, "No policy for zone"
            ),
            make_event(p2, d_lab5, z_lab5, "ALLOW", "face", 155, 0.89),
        ]
        for event in events:
            await self.repos["events"].insert(event)

        print(
            "[SEED] Готово! Создано: 6 групп, 6 зон, 5 устройств, 10 людей, 3 политики, 12 событий."
        )
