from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from routers import people, events, groups

app = FastAPI(title="СКУД ЛЭТИ")

@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")

app.include_router(people.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(groups.router, prefix="/api/v1")