from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from db.base import Base
import asyncpg

DATABASE_USER = 'postgres'
DATABASE_PASSWORD = 'defect0'
DATABASE_NAME = 'defectdb'

DATABASE_URL = f"postgresql+asyncpg://{DATABASE_USER}:{DATABASE_PASSWORD}@0.0.0.0:5432/{DATABASE_NAME}"


engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def create_tables():
    try:
        conn = await asyncpg.connect(user=DATABASE_USER, password=DATABASE_PASSWORD, database=DATABASE_NAME)
    except asyncpg.InvalidCatalogNameError:
        sys_conn = await asyncpg.connect(
            database='postgres',
            user=DATABASE_USER,
            password=DATABASE_PASSWORD
        )
        await sys_conn.execute(
            f'CREATE DATABASE "{DATABASE_NAME}" OWNER "{DATABASE_USER}"'
        )
        await sys_conn.close()
    else:
        conn.close()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
