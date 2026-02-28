from pymongo import MongoClient
from datetime import datetime, timezone

# Подключение к локальной бд
client = MongoClient("mongodb://localhost:27017")
db = client["skud_university"]

# Коллекция persons 
db.persons.drop()

person = {
    "full_name": "Иванов Иван Иванович",
    "role": "student",
    "department": "Кафедра информатики",
    "status": "active",
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc)
}

p_result = db.persons.insert_one(person)
print(f"[persons] Вставлен: {p_result.inserted_id}")

# Поиск регистронезависимый  поэтому $options: "i" обязателен везде
p_doc = db.persons.find_one({"full_name": {"$regex": "Иванов Иван Иванович", "$options": "i"}})
print(f"[persons] Прочитан: {p_doc['full_name']}, роль={p_doc['role']}, статус={p_doc['status']}")

# Коллекция biometric_templates
db.biometric_templates.drop()

template = {
    "person_id": p_result.inserted_id,
    "type": "face",
    "quality_score": 0.95,
    "device_id": None,
    "created_at": datetime.now(timezone.utc),
    "version": 1
}

t_result = db.biometric_templates.insert_one(template)
print(f"[biometric_templates] Вставлен: {t_result.inserted_id}")

t_doc = db.biometric_templates.find_one({"type": {"$regex": "face", "$options": "i"}})
print(f"[biometric_templates] Прочитан: тип={t_doc['type']}, качество={t_doc['quality_score']}")

# Коллекция zones
db.zones.drop()

zone = {
    "name": "Главный вход",
    "building": "Корпус А",
    "class": "public"
}

z_result = db.zones.insert_one(zone)
print(f"[zones] Вставлена: {z_result.inserted_id}")

z_doc = db.zones.find_one({"name": {"$regex": "главный вход", "$options": "i"}})
print(f"[zones] Прочитана: {z_doc['name']}, корпус={z_doc['building']}")

# Коллекция devices
db.devices.drop()

device = {
    "type": "camera",
    "zone_id": z_result.inserted_id,
    "firmware_version": "1.0.0"
}

d_result = db.devices.insert_one(device)
print(f"[devices] Вставлено: {d_result.inserted_id}")

d_doc = db.devices.find_one({"type": {"$regex": "camera", "$options": "i"}})
print(f"[devices] Прочитано: тип={d_doc['type']}, прошивка={d_doc['firmware_version']}")

# Коллекция access_policies: политики доступа: кому, куда и в какое время разрешён вход
db.access_policies.drop()

policy = {
    "person_id": p_result.inserted_id,
    "allowed_zone_ids": [z_result.inserted_id],
    "schedule": {
        "days": ["mon", "tue", "wed", "thu", "fri"],
        "time_from": "08:00",
        "time_to": "20:00"
    },
    "valid_from": datetime.now(timezone.utc),
    "valid_to": None
}

ap_result = db.access_policies.insert_one(policy)
print(f"[access_policies] Вставлена: {ap_result.inserted_id}")

ap_doc = db.access_policies.find_one({"person_id": p_result.inserted_id})
print(f"[access_policies] Прочитана: person_id={ap_doc['person_id']}, зон={len(ap_doc['allowed_zone_ids'])}")

# Коллекция access_events ; лог каждой попытки прохода (ALLOW / DENY)
db.access_events.drop()

event = {
    "timestamp": datetime.now(timezone.utc),
    "person_id": p_result.inserted_id,
    "device_id": d_result.inserted_id,
    "zone_id": z_result.inserted_id,
    "auth_method": "face",
    "decision": "ALLOW",
    "reason": None,
    "recognition_score": 0.97
}

e_result = db.access_events.insert_one(event)
print(f"[access_events] Вставлено: {e_result.inserted_id}")

e_doc = db.access_events.find_one({"decision": {"$regex": "allow", "$options": "i"}})
print(f"[access_events] Прочитано: метод={e_doc['auth_method']}, решение={e_doc['decision']}, score={e_doc['recognition_score']}")

client.close()