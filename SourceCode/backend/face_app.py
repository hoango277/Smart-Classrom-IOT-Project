from fastapi import FastAPI

from routers import face
from services.mqtt_client import start_mqtt, stop_mqtt

app = FastAPI(title="Face Service", docs_url="/docs", openapi_url="/openapi.json")


@app.on_event("startup")
async def startup_event():
    start_mqtt()


@app.on_event("shutdown")
async def shutdown_event():
    stop_mqtt()


app.include_router(face.router)

