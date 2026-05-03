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

    async def setup_infrastructure(self):
        root_id = await self.repos["groups"].insert(
            {"name": "Студенты", "parent_group_id": None, "description": "Все студенты"}
        )
        child_id = await self.repos["groups"].insert(
            {"name": "1 курс", "parent_group_id": root_id, "description": "1 курс"}
        )
        zone_id = await self.repos["zones"].insert(
            {"name": "Лаборатория 3", "building": "Корпус 5", "type": "auditorium"}
        )
        device_id = await self.repos["devices"].insert(
            {"type": "terminal", "zone_id": zone_id, "firmware_version": "1.0.3"}
        )
        return {"root_group_id": root_id, "child_group_id": child_id, "zone_id": zone_id, "device_id": device_id}

    async def register_person(self, full_name, role, department, group_id, face_embedding):
        person = {
            "full_name": full_name,
            "role": role,
            "department": department,
            "status": "active",
            "group_ids": [group_id],
            "biometrics": [{
                "type": "face",
                "embedding": face_embedding,
                "embedding_dimension": len(face_embedding),
                "model_version": "face_model_v1.2",
                "quality_score": 0.91,
                "raw_data_ref": None,
                "created_at": datetime.now(timezone.utc),
            }],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        return await self.repos["persons"].insert(person)

    async def assign_group_policy(self, group_id, zone_id):
        policy = {
            "target_type": "group",
            "target_id": group_id,
            "allowed_zone_ids": [zone_id],
            "schedule": {
                "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
                "time_from": "08:00",
                "time_to": "20:00",
            },
            "valid_from": datetime.now(timezone.utc),
            "valid_to": None,
        }
        return await self.repos["policies"].insert(policy)

    async def log_access(self, person_id, device_id, zone_id, decision="ALLOW"):
        event = {
            "timestamp": datetime.now(timezone.utc),
            "person_id": person_id,
            "device_id": device_id,
            "zone_id": zone_id,
            "auth_method": "face",
            "decision": decision,
            "reason": "OK" if decision == "ALLOW" else "Access Denied",
            "recognition_score": 0.87,
        }
        return await self.repos["events"].insert(event)

    async def seed_database(self):
        db = get_database()

        admin_exists = await db.users.find_one({"username": "admin"})
        if admin_exists:
            print("[SEED] База уже инициализирована.")
            return

        print("[SEED] Инициализация тестовых данных...")

        users = [
            {"username": "admin", "password": get_password_hash("admin123"), "role": "admin",
             "full_name": "Администратор"},
            {"username": "guard", "password": get_password_hash("guard123"), "role": "guard", "full_name": "Охранник"}
        ]
        await db.users.insert_many(users)

        infra = await self.setup_infrastructure()
        person_id = await self.register_person(
            full_name="Студентов Петр Иванович", role="student", department="ФКТИ",
            group_id=infra["root_group_id"], face_embedding=[0.1, 0.2, 0.3]
        )
        await self.assign_group_policy(infra["root_group_id"], infra["zone_id"])
        await self.log_access(person_id, infra["device_id"], infra["zone_id"], "ALLOW")

        print("[SEED] Готово!")