from bson import ObjectId
from typing import Optional
from datetime import datetime

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

        if "allowed_zone_ids" in doc:
            doc["allowed_zone_ids"] = [str(zone_id) for zone_id in doc["allowed_zone_ids"]]

        for field in ["person_id", "device_id", "zone_id", "parent_group_id", "target_id"]:
            if field in doc and doc[field] is not None:
                doc[field] = str(doc[field])
        return doc

class PersonRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.persons)

    async def filter(
        self,
        full_name: str = None,
        role: str = None,
        department: str = None,
        status: str = None,
        skip: int = 0,
        limit: int = 100,
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

        cursor = self.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]


class EventRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.access_events)

    async def filter(
        self,
        zone_id: str = None,
        date_from: datetime = None,
        date_to: datetime = None,
        decision: str = None,
        skip: int = 0,
        limit: int = 100,
    ):
        query = {}

        if zone_id:
            query["zone_id"] = ObjectId(zone_id)
        if decision:
            query["decision"] = {"$regex": f"^{decision}$", "$options": "i"}
        if date_from or date_to:
            query["timestamp"] = {}
            if date_from:
                query["timestamp"]["$gte"] = date_from
            if date_to:
                query["timestamp"]["$lte"] = date_to

        cursor = self.collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]


class GroupRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.groups)

    async def filter(
        self,
        name: str = None,
        description: str = None,
        parent_group_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        query = dict()

        if name:
            query["name"] = {"$regex": name, "$options": "i"}
        if description:
            query["description"] = {"$regex": description, "$options": "i"}
        if parent_group_id:
            query["parent_group_id"] = ObjectId(parent_group_id)

        finds = self.collection.find(query).skip(skip).limit(limit)
        docs = await finds.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]


class ZoneRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.zones)

    async def filter(
        self,
        name: str = None,
        building: str = None,
        type: str = None,
        skip: int = 0,
        limit: int = 100,
    ):
        query = {}

        if name:
            query["name"] = {"$regex": name, "$options": "i"}
        if building:
            query["building"] = {"$regex": building, "$options": "i"}
        if type:
            query["type"] = {"$regex": type, "$options": "i"}

        cursor = self.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]

class DeviceRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.devices)

    async def filter(
        self,
        type: str = None,
        zone_id: str = None,
        firmware_version: str = None,
        skip: int = 0,
        limit: int = 100,
    ):
        query = {}

        if zone_id:
            query["zone_id"] = ObjectId(zone_id)
        if type:
            query["type"] = {"$regex": type, "$options": "i"}
        if firmware_version:
            query["firmware_version"] = {"$regex": firmware_version, "$options": "i"}

        cursor = self.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]


class PolicyRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.access_policies)

    async def filter(
        self,
        target_type: str = None,
        target_id: str = None,
        zone_id: str = None,
        valid_from: datetime = None,
        valid_to: datetime = None,
        skip: int = 0,
        limit: int = 100,
    ):
        query = {}

        if target_type:
            query["target_type"] = {"$regex": f"^{target_type}$", "$options": "i"}

        if target_id:
            query["target_id"] = ObjectId(target_id)

        if zone_id:
            query["allowed_zone_ids"] = ObjectId(zone_id)

        if valid_from:
            query["valid_to"] = {"$gte": valid_from}

        if valid_to:
            query["valid_from"] = {"$lte": valid_to}

        cursor = self.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._serialize(doc) for doc in docs]
