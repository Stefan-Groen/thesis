import sqlite3

db_path = '/Users/stefan/Documents/thesis_code/articles.db'

def setup_db(db_path):
    connect = sqlite3.connect(db_path)
    cursor = connect.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, 
            link TEXT UNIQUE,
            date_published DATETIME       
            )
    """)

    connect.commit()
    connect.close()

if __name__ == "__main__":
    setup_db(db_path)