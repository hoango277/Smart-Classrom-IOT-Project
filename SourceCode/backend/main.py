from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from configs.database import Base, async_engine
from models import *
from routers import authentication, user, face
from services.mqtt_client import start_mqtt, stop_mqtt

app = FastAPI()


@app.on_event('startup')
async def on_startup():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_mqtt()


@app.on_event('shutdown')
async def on_shutdown():
    await async_engine.dispose()
    stop_mqtt()


app.include_router(authentication.router)
app.include_router(user.router)
app.include_router(face.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
