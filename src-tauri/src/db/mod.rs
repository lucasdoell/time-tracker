mod error;
mod models;
pub mod schema;

use anyhow::Result;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};

pub use models::TimeEntry;

pub type DbConnection = Arc<Mutex<Connection>>;

/// Initialize the database connection and create tables if they don't exist
pub fn init_db() -> Result<DbConnection> {
    let conn = Connection::open("time_tracker.db")?;

    // Create tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS time_entries (
            id TEXT PRIMARY KEY,
            activity TEXT NOT NULL,
            elapsed INTEGER NOT NULL,
            description TEXT,
            timestamp TEXT NOT NULL,
            tags TEXT,
            last_modified TEXT NOT NULL DEFAULT (datetime('now')),
            synced INTEGER DEFAULT 0,
            sync_id TEXT,
            user_id TEXT
        )",
        [],
    )?;

    // Add migration if table already exists
    let pragma: i32 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('time_entries') WHERE name = 'last_modified'",
        [],
        |row| row.get(0),
    )?;
    if pragma == 0 {
        conn.execute("ALTER TABLE time_entries ADD COLUMN last_modified TEXT", [])?;
        conn.execute(
            "UPDATE time_entries SET last_modified = datetime('now') WHERE last_modified IS NULL",
            [],
        )?;
    }

    let pragma: i32 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('time_entries') WHERE name = 'synced'",
        [],
        |row| row.get(0),
    )?;
    if pragma == 0 {
        conn.execute(
            "ALTER TABLE time_entries ADD COLUMN synced INTEGER DEFAULT 0",
            [],
        )?;
    }

    let pragma: i32 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('time_entries') WHERE name = 'sync_id'",
        [],
        |row| row.get(0),
    )?;
    if pragma == 0 {
        conn.execute("ALTER TABLE time_entries ADD COLUMN sync_id TEXT", [])?;
    }

    let pragma: i32 = conn.query_row(
        "SELECT count(*) FROM pragma_table_info('time_entries') WHERE name = 'user_id'",
        [],
        |row| row.get(0),
    )?;
    if pragma == 0 {
        conn.execute("ALTER TABLE time_entries ADD COLUMN user_id TEXT", [])?;
    }

    Ok(Arc::new(Mutex::new(conn)))
}

/// Get the database connection
pub fn get_db_connection() -> Result<DbConnection> {
    init_db()
}
