-- V2: add tsvector columns, GIN indexes and trigram for similarity ranking

-- Ensure pg_trgm and unaccent extensions exist for better search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add tsvector column to tests and runs
ALTER TABLE tests
  ADD COLUMN IF NOT EXISTS document_tsv tsvector;

ALTER TABLE runs
  ADD COLUMN IF NOT EXISTS document_tsv tsvector;

-- Populate tsvector for existing rows
UPDATE tests SET document_tsv = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(metadata::text, ''));
UPDATE runs SET document_tsv = to_tsvector('english', coalesce(metadata::text, ''));

-- Create function to update tsvector on change
CREATE OR REPLACE FUNCTION tests_tsv_trigger() RETURNS trigger AS $$
begin
  new.document_tsv := to_tsvector('english', coalesce(new.name, '') || ' ' || coalesce(new.metadata::text, ''));
  return new;
end
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION runs_tsv_trigger() RETURNS trigger AS $$
begin
  new.document_tsv := to_tsvector('english', coalesce(new.metadata::text, ''));
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tests_tsv_update BEFORE INSERT OR UPDATE ON tests
FOR EACH ROW EXECUTE FUNCTION tests_tsv_trigger();

CREATE TRIGGER runs_tsv_update BEFORE INSERT OR UPDATE ON runs
FOR EACH ROW EXECUTE FUNCTION runs_tsv_trigger();

-- GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_tests_document_tsv ON tests USING GIN (document_tsv);
CREATE INDEX IF NOT EXISTS idx_runs_document_tsv ON runs USING GIN (document_tsv);

-- Optional: create trigram indexes on name to support similarity
CREATE INDEX IF NOT EXISTS idx_tests_name_trgm ON tests USING GIN (name gin_trgm_ops);

-- Example of a weighted search view (optional)
CREATE OR REPLACE VIEW v_search_candidates AS
SELECT id, 'test' AS type, ts_rank(document_tsv, query) AS rank, ts_headline(coalesce(name, ''), query) as snippet
FROM tests, to_tsquery('english', '') AS query
WHERE TRUE;

