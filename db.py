import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///rss_DB.db"
engine = create_engine(DATABASE_URL, future=True)

def init_db():
    dialect = engine.dialect.name
    if dialect == "sqlite":
        create_sql = """
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT DEFAULT 'PENDING' CHECK (status IN ('FAILED','PENDING','SENT')),
            title TEXT NOT NULL,
            link TEXT NOT NULL UNIQUE,
            summary TEXT,
            date_published TEXT,
            source TEXT,
            added_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """
    else:
        create_sql = """
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            status TEXT DEFAULT 'PENDING' CHECK (status IN ('FAILED','PENDING','SENT')),
            title TEXT NOT NULL,
            link TEXT NOT NULL UNIQUE,
            summary TEXT,
            date_published TEXT,
            source TEXT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    with engine.begin() as conn:
        conn.execute(text(create_sql))

def insert_article_safe(article):
    if engine.dialect.name == "sqlite":
        sql = text("""
            INSERT OR IGNORE INTO articles
            (title, link, summary, date_published, source)
            VALUES (:title, :link, :summary, :date_published, :source)
        """)
    else:
        sql = text("""
            INSERT INTO articles
            (title, link, summary, date_published, source)
            VALUES (:title, :link, :summary, :date_published, :source)
            ON CONFLICT (link) DO NOTHING
        """)
    with engine.begin() as conn:
        conn.execute(sql, article)
