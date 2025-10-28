import sqlite3
from pathlib import Path

# database path
DB_path = Path("/Users/stefan/Documents/thesis_code/rss_DB.db")

def setup_database(DB_path):
    
    # connect to database (creates file if missing)
    connect = sqlite3.connect(DB_path)
    cursor = connect.cursor()

    # create tables for storing articles and classifications
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT DEFAULT 'PENDING' CHECK(status IN ('FAILED', 'PENDING', 'SENT')),
        title TEXT NOT NULL,
        link TEXT NOT NULL UNIQUE,
        summary TEXT,
        date_published TEXT,
        source TEXT,
        added_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)


    connect.commit()
    connect.close()
    print(f'database created at {DB_path}')


if __name__ == "__main__":
    setup_database(DB_path)

                         
                        