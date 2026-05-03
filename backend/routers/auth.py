from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from database import get_database
from services import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"username": form_data.username})

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")

    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_me(current_username: str = Depends(get_current_user)):
    db = get_database()
    user = await db.users.find_one({"username": current_username})
    return {"username": user["username"], "role": user["role"], "full_name": user["full_name"]}