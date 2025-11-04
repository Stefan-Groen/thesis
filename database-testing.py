import sqlite3

conn = sqlite3.connect('rss_DB.db')
cursor = conn.cursor()

cursor.execute("""
UPDATE articles
SET status = 'SENT'
WHERE status = 'PENDING'
AND id NOT IN (
    SELECT id FROM articles
    WHERE status = 'PENDING'
    LIMIT 2
);
""")

conn.commit()
conn.close()

print("Done! Only 2 pending rows left.")
