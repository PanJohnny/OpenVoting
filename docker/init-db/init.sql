-- Vytvoření tabulky users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  organizator BOOLEAN DEFAULT FALSE,
  administrator BOOLEAN DEFAULT FALSE,
  password TEXT NOT NULL, -- pro uložení hashe hesla
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření tabulky groups
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_owner ON groups(owner_id);

-- Vytvoření tabulky group_memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, group_id)
);

CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);

-- Vytvoření tabulky polls
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP,
  anonymous BOOLEAN DEFAULT FALSE,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  max_options INTEGER DEFAULT 1, -- počet možností, které lze vybrat (1 = jedna volba, NULL = neomezeno)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Zajištění, že anonymní anketa nemá skupinu
  CONSTRAINT anonymous_no_group CHECK (NOT (anonymous = TRUE AND group_id IS NOT NULL)),
  -- Zajištění, že expirace je v budoucnosti
  CONSTRAINT expires_in_future CHECK (expires IS NULL OR expires > CURRENT_TIMESTAMP),
  -- Zajištění, že max_options je kladné číslo nebo NULL
  CONSTRAINT valid_max_options CHECK (max_options IS NULL OR max_options > 0)
);

CREATE INDEX idx_polls_owner ON polls(owner_id);
CREATE INDEX idx_polls_group ON polls(group_id);

-- Vytvoření tabulky poll_options (možnosti hlasování)
CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0, -- pořadí zobrazení možnosti
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

-- Vytvoření tabulky poll_voters pro anonymní hlasování
CREATE TABLE IF NOT EXISTS poll_voters (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  private_key TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_poll_voters_poll ON poll_voters(poll_id);

-- Vytvoření tabulky poll_votes (zaznamenané hlasy)
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  voter_key_id INTEGER REFERENCES poll_voters(id) ON DELETE CASCADE,
  signature TEXT, -- pro ověření anonymního hlasování
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Zajištění, že máme buď user_id NEBO voter_key_id, nikdy obojí nebo žádné
  CONSTRAINT vote_source_check CHECK (
    (user_id IS NOT NULL AND voter_key_id IS NULL) OR
    (user_id IS NULL AND voter_key_id IS NOT NULL)
  )
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_voter_key ON poll_votes(voter_key_id);

-- Funkce pro aktualizaci timestamp při updatu
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery pro aktualizaci timestamp
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_groups_timestamp
BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_polls_timestamp
BEFORE UPDATE ON polls
FOR EACH ROW EXECUTE FUNCTION update_timestamp();