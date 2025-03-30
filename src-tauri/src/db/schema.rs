use anyhow::Result;
use rusqlite::params;

use super::models::TimeEntry;
use super::DbConnection;

/// Save a time entry to the database
pub fn save_time_entry(conn: &DbConnection, entry: &TimeEntry) -> Result<()> {
    let conn = conn.lock().unwrap();
    let (id, activity, elapsed, description, timestamp, tags) = entry.to_params();

    conn.execute(
        "INSERT OR REPLACE INTO time_entries (id, activity, elapsed, description, timestamp, tags)
         VALUES (?, ?, ?, ?, ?, ?)",
        params![id, activity, elapsed, description, timestamp, tags],
    )?;

    Ok(())
}

/// Get all time entries from the database
pub fn get_all_time_entries(conn: &DbConnection) -> Result<Vec<TimeEntry>> {
    let conn = conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, activity, elapsed, description, timestamp, tags
         FROM time_entries
         ORDER BY timestamp DESC",
    )?;

    let entries = stmt
        .query_map([], |row| TimeEntry::from_row(row))?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(entries)
}

/// Get a time entry by its ID
pub fn get_time_entry_by_id(conn: &DbConnection, id: &str) -> Result<Option<TimeEntry>> {
    let conn = conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, activity, elapsed, description, timestamp, tags
         FROM time_entries
         WHERE id = ?",
    )?;

    let mut entries = stmt
        .query_map(params![id], |row| TimeEntry::from_row(row))?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(entries.pop())
}

/// Delete a time entry by its ID
pub fn delete_time_entry(conn: &DbConnection, id: &str) -> Result<bool> {
    let conn = conn.lock().unwrap();
    let rows_affected = conn.execute("DELETE FROM time_entries WHERE id = ?", params![id])?;

    Ok(rows_affected > 0)
}

/// Update a time entry
pub fn update_time_entry(conn: &DbConnection, entry: &TimeEntry) -> Result<bool> {
    let conn = conn.lock().unwrap();
    let (id, activity, elapsed, description, timestamp, tags) = entry.to_params();

    let rows_affected = conn.execute(
        "UPDATE time_entries
         SET activity = ?, elapsed = ?, description = ?, timestamp = ?, tags = ?
         WHERE id = ?",
        params![activity, elapsed, description, timestamp, tags, id],
    )?;

    Ok(rows_affected > 0)
}
