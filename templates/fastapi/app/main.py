from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    app_name: str = "app"
    database_url: str = "postgresql+asyncpg://localhost/app"


class ItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class ItemOut(BaseModel):
    id: int
    name: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.settings = Settings()
    yield


app = FastAPI(lifespan=lifespan)


def settings() -> Settings:
    return app.state.settings


@app.get("/health")
async def health(config: Annotated[Settings, Depends(settings)]) -> dict[str, str]:
    return {"status": "ok", "app": config.app_name}


@app.post("/items", response_model=ItemOut, status_code=201)
async def create_item(item: ItemIn) -> ItemOut:
    if item.name.lower() == "duplicate":
        raise HTTPException(status_code=409, detail={"code": "duplicate", "message": "Item exists"})
    return ItemOut(id=1, name=item.name)
