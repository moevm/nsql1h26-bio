from datetime import datetime, timezone

class SkudService:
    def __init__(self, repos: dict):
        self.repos = repos

    def clear_all_data(self):
        """Очистка всех коллекций"""
        for repo in self.repos.values():
            repo.drop_collection()

    def setup_infrastructure(self):
        """Создание базовых зон, устройств и групп"""

        # GROUPS
        root_id = self.repos['groups'].insert({
            "name": "Студенты",
            "parent_group_id": None,
            "description": "Все студенты университета"
        })
        
        child_id = self.repos['groups'].insert({
            "name": "1 курс",
            "parent_group_id": root_id,
            "description": "Студенты первого курса"
        })

        #ZONES
        zone_id = self.repos['zones'].insert({
            "name": "Лаборатория 3",
            "building": "Корпус 5",
            "type": "auditorium"
        })

        #DEVICES 
        device_id = self.repos['devices'].insert({
            "type": "terminal",
            "zone_id": zone_id,
            "firmware_version": "1.0.3"
        })

        return {"root_group_id": root_id, "child_group_id": child_id, "zone_id": zone_id, "device_id": device_id}

    def register_person(self, full_name, role, department, group_id, face_embedding):
        """Регистрация пользователя с влож. биометрией"""
        
        person = {
            "full_name": full_name,
            "role": role,
            "department": department,
            "status": "active",
            "group_ids": [group_id],
            "biometrics": [
                {
                    "type": "face",
                    "embedding": face_embedding,
                    "embedding_dimension": len(face_embedding),
                    "model_version": "face_model_v1.2",
                    "quality_score": 0.91,
                    "raw_data_ref": None,
                    "created_at": datetime.now(timezone.utc)
                }
            ],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        return self.repos['persons'].insert(person)

    def assign_group_policy(self, group_id, zone_id):
        """Назначение прав на группу"""
        policy = {
            "target_type": "group",
            "target_id": group_id,
            "allowed_zone_ids": [zone_id],
            "schedule": {
                "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
                "time_from": "08:00",
                "time_to": "20:00"
            },
            "valid_from": datetime.now(timezone.utc),
            "valid_to": None
        }
        return self.repos['policies'].insert(policy)

    def log_access(self, person_id, device_id, zone_id, decision="ALLOW"):
        """Логирование попытки прохода"""
        event = {
            "timestamp": datetime.now(timezone.utc),
            "person_id": person_id,
            "device_id": device_id,
            "zone_id": zone_id,
            "auth_method": "face",
            "decision": decision,
            "reason": "OK" if decision == "ALLOW" else "Access Denied",
            "recognition_score": 0.87
        }
        return self.repos['events'].insert(event)
