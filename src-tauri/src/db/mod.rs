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
            tags TEXT
        )",
        [],
    )?;

    Ok(Arc::new(Mutex::new(conn)))
}

/// Get the database connection
pub fn get_db_connection() -> Result<DbConnection> {
    init_db()
}
