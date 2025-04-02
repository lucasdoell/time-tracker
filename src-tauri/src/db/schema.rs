use anyhow::Result;
use rusqlite::params;

use super::models::TimeEntry;
use super::DbConnection;

/// Save a time entry to the database
pub fn save_time_entry(conn: &DbConnection, entry: &TimeEntry) -> Result<()> {
    let conn = conn.lock().unwrap();
    let (
        id,
        activity,
        elapsed,
        description,
        timestamp,
        tags,
        last_modified,
        synced,
        sync_id,
        user_id,
    ) = entry.to_params();

    conn.execute(
        "INSERT OR REPLACE INTO time_entries (id, activity, elapsed, description, timestamp, tags, last_modified, synced, sync_id, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![id, activity, elapsed, description, timestamp, tags, last_modified, synced, sync_id, user_id],
    )?;

    Ok(())
}

/// Get all time entries from the database
pub fn get_all_time_entries(conn: &DbConnection) -> Result<Vec<TimeEntry>> {
    let conn = conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, activity, elapsed, description, timestamp, tags, last_modified, synced, sync_id, user_id
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
        "SELECT id, activity, elapsed, description, timestamp, tags, last_modified, synced, sync_id, user_id
         FROM time_entries
         WHERE id = ?",
    )?;

    let mut entries = stmt
        .query_map(params![id], |row| TimeEntry::from_row(row))?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(entries.pop())
}

/// Get all unsynced entries
pub fn get_unsynced_entries(conn: &DbConnection) -> Result<Vec<TimeEntry>> {
    let conn = conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, activity, elapsed, description, timestamp, tags, last_modified, synced, sync_id, user_id
         FROM time_entries
         WHERE synced = 0
         ORDER BY last_modified DESC",
    )?;

    let entries = stmt
        .query_map([], |row| TimeEntry::from_row(row))?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(entries)
}

/// Mark an entry as synced
pub fn mark_entry_synced(conn: &DbConnection, id: &str, sync_id: Option<String>) -> Result<bool> {
    let conn = conn.lock().unwrap();
    let rows_affected = conn.execute(
        "UPDATE time_entries SET synced = 1, sync_id = ? WHERE id = ?",
        params![sync_id, id],
    )?;

    Ok(rows_affected > 0)
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
    let (
        id,
        activity,
        elapsed,
        description,
        timestamp,
        tags,
        last_modified,
        synced,
        sync_id,
        user_id,
    ) = entry.to_params();

    let rows_affected = conn.execute(
        "UPDATE time_entries
         SET activity = ?, elapsed = ?, description = ?, timestamp = ?, tags = ?, 
             last_modified = ?, synced = ?, sync_id = ?, user_id = ?
         WHERE id = ?",
        params![
            activity,
            elapsed,
            description,
            timestamp,
            tags,
            last_modified,
            synced,
            sync_id,
            user_id,
            id
        ],
    )?;

    Ok(rows_affected > 0)
}
