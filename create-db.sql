CREATE TABLE IF NOT EXISTS articles (
  id              SERIAL PRIMARY KEY,
  status          TEXT DEFAULT 'PENDING' CHECK (status IN ('FAILED','PENDING','SENT')),
  title           TEXT NOT NULL,
  link            TEXT NOT NULL UNIQUE,
  summary         TEXT,
  date_published  TIMESTAMPTZ,
  source          TEXT,
  date_added      TIMESTAMPTZ DEFAULT NOW(),
  classification  TEXT DEFAULT '' CHECK (classification IN ('Threat','Opportunity','Neutral','')),
  explanation     TEXT DEFAULT '',
  pdf             TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date_published);
