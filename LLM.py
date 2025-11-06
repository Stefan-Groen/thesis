import os 
import psycopg
from dotenv import load_dotenv
import csv

def get_pending_entries(limit: int | None = None):
    """
    Connect to Neon and fetch rows with status PENDING
    """

    load_dotenv()
    CONN_STRING = os.getenv('DATABASE_URL')
    if not CONN_STRING: 
        raise RuntimeError("DATABASE_URL not found in environment variables.")
    
    sql = """
        SELECT id, status, title, link, summary, date_published, source, date_added
        FROM articles
        WHERE status = 'PENDING'
        ORDER BY date_published ASC
    """
    if limit is not None:
        sql += ' LIMIT %s'


    with psycopg.connect(CONN_STRING) as conn:
        with conn.cursor() as cursor:
            if limit is not None:
                cursor.execute(sql, (limit,))
            else:
                cursor.execute(sql)
            rows = cursor.fetchall()
    return rows

    ## - - - - - output example 'rows'  - - - - -
    # [
    # (1, "NOS article title", "https://...", "...summary...", "2025-11-06 ...", "NOS", "2025-11-06 ...", "PENDING"),
    # (2, "Another article", "https://...", "...", None, "NOS", "2025-11-06 ...", "PENDING")
    # ]

 
def main():
    """
    This is the LLM module
    """

    new_entries = get_pending_entries()
    len_new_entries = len(new_entries)
    print(f'Fetched {len(new_entries)} entries with status "PENDING"')





if __name__ == "__main__":
    main()