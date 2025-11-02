-- V1__create_core_tables.sql
-- Creates core entities: tests, runs, artifacts, operations, idempotency

CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  name TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  filename TEXT,
  url TEXT,
  provider TEXT,
  size_bytes BIGINT,
  sha256 TEXT,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Operations table for async background work
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB,
  warnings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Idempotency store: Idempotency-Key dedupe with 24h TTL
CREATE TABLE IF NOT EXISTS idempotency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT NOT NULL UNIQUE,
  request_fingerprint TEXT,
  response_code INT,
  response_body JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency (expires_at);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations (status, created_at);

-- Helper trigger to keep updated_at columns in sync
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tests_updated_at BEFORE UPDATE ON tests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER runs_updated_at BEFORE UPDATE ON runs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER operations_updated_at BEFORE UPDATE ON operations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

