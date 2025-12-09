from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from configs.database import async_engine, init_db
from models import *
from configs.firmware_storage import UPLOAD_DIR
from routers import authentication, user, firmware, environment

app = FastAPI()


@app.on_event('startup')
async def on_startup():
    await init_db()


@app.on_event('shutdown')
async def on_shutdown():
    await async_engine.dispose()


app.include_router(authentication.router)
app.include_router(user.router)
app.include_router(firmware.router)
app.include_router(environment.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
