from bson import ObjectId
from datetime import datetime
from typing import Optional


class BaseRepository:
    def __init__(self, collection):
        self.collection = collection

    async def drop_collection(self):
        await self.collection.drop()

    async def insert(self, document: dict):
        result = await self.collection.insert_one(document)
        return result.inserted_id

    async def find_one(self, query: dict):
        return await self.collection.find_one(query)

    async def find_by_id(self, id: str):
        doc = await self.collection.find_one({"_id": ObjectId(id)})
        return self._serialize(doc)

    async def update(self, id: str, data: dict):
        await self.collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        return await self.find_by_id(id)
    
    async def delete(self, id: str):
        await self.collection.delete_one({"_id": ObjectId(id)})


    def _serialize(self, doc: dict) -> dict:
        if not doc:
            return doc
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        if "group_ids" in doc:
            doc["group_ids"] = [str(gid) for gid in doc["group_ids"]]
        for field in ["person_id", "device_id", "zone_id", "parent_group_id"]:
            if field in doc and doc[field] is not None:
                doc[field] = str(doc[field])
        return doc

class PersonRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.persons)

    async def filter(
        self,
        full_name: str = None,  # поиск по подстроке, регистронезависимо
        role: str = None,  # точное совпадение: student / staff / guest
        department: str = None,  # поиск по подстроке, регистронезависимо
        status: str = None,  # точное совпадение: active / blocked
    ):
        query = {}

        if full_name:
            query["full_name"] = {"$regex": full_name, "$options": "i"}
        if department:
            query["department"] = {"$regex": department, "$options": "i"}
        if role:
            query["role"] = role
        if status:
            query["status"] = status

        cursor = self.collection.find(query)
        docs = await cursor.to_list(length=1000)
        return [self._serialize(doc) for doc in docs]


class EventRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.access_events)

    async def filter(
        self,
        zone_id: str = None,  # точное совпадение по zone_id
        date_from: datetime = None,  # начало диапазона timestamp
        date_to: datetime = None,  # конец диапазона timestamp
        decision: str = None,  # ALLOW / DENY
    ):
        query = {}

        if zone_id:
            query["zone_id"] = ObjectId(zone_id)
        if decision:
            query["decision"] = decision
        if date_from or date_to:
            query["timestamp"] = {}
            if date_from:
                query["timestamp"]["$gte"] = date_from
            if date_to:
                query["timestamp"]["$lte"] = date_to

        cursor = self.collection.find(query).sort("timestamp", -1)
        docs = await cursor.to_list(length=1000)
        return [self._serialize(doc) for doc in docs]


class GroupRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.groups)

    async def filter(
        self,
        name: str = None,
        description: str = None,
        parent_group_id: Optional[str] = None,  # точное совпадение по parent_group_id
    ):
        query = dict()

        if name:
            query["name"] = {"$regex": name, "$options": "i"}
        if description:
            query["description"] = {"$regex": description, "$options": "i"}
        if parent_group_id:
            query["parent_group_id"] = ObjectId(parent_group_id)

        finds = self.collection.find(query)
        docs = await finds.to_list(length=1000)
        return [self._serialize(doc) for doc in docs]


class ZoneRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.zones)


class DeviceRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.devices)


class PolicyRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.access_policies)
