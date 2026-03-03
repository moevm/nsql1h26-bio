from pymongo import MongoClient


def get_database():
    # Подключение к локальной бд
    client = MongoClient("mongodb://localhost:27017")
    return client["skud_university"]
