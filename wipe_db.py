import os
import sys
from sqlalchemy import create_engine, text

db_url = 'postgresql+psycopg://postgres.dsxhtodkbefqxsqyhuyv:Sandhya%408885860218@aws-0-ap-south-1.pooler.supabase.com:5432/postgres'
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        conn.execute(text('DELETE FROM assets;'))
        conn.execute(text('DELETE FROM findings;'))
        conn.execute(text('DELETE FROM scans;'))
        conn.execute(text('DELETE FROM projects;'))
        conn.commit()
    print('Database wiped clean!')
except Exception as e:
    print('Failed:', str(e))
