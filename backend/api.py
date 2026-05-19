from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import people, events, groups, auth, zones, devices, data, policies

app = FastAPI(title="СКУД ЛЭТИ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(people.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(groups.router, prefix="/api/v1")
app.include_router(zones.router, prefix="/api/v1")
app.include_router(devices.router, prefix="/api/v1")
app.include_router(data.router, prefix="/api/v1")
app.include_router(policies.router, prefix="/api/v1")