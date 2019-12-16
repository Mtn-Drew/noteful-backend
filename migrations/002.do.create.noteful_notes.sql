CREATE TABLE notes (
    id uuid DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    content TEXT,
    modified TIMESTAMP DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    folderId uuid REFERENCES folders(id) ON DELETE CASCADE NOT NULL
)