
# классы отвечают только за запросы в бд
class BaseRepository:
    def __init__(self, collection):
        self.collection = collection

    def drop_collection(self):
        self.collection.drop()

    def insert(self, document: dict):
        result = self.collection.insert_one(document)
        return result.inserted_id

    def find_one(self, query: dict):
        return self.collection.find_one(query)


class PersonRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.persons)
        
    def find_by_name_insensitive(self, name: str):
        # без штрафа 
        return self.collection.find_one({"full_name": {"$regex": name, "$options": "i"}})


class EventRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.access_events)
        
    def find_events_in_timerange(self, date_from, date_to):
        # без штрафа 
        query = {
            "timestamp": {
                "$gte": date_from,
                "$lte": date_to
            }
        }
        return list(self.collection.find(query))


class GroupRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.groups)


class ZoneRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.zones)


class DeviceRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.devices)


class PolicyRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db.access_policies)
