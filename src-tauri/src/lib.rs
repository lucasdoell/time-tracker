mod db;

use db::{get_db_connection, schema, TimeEntry};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::State;

struct AppState {
    db_conn: db::DbConnection,
}

#[derive(Debug, Serialize, Deserialize)]
struct SyncResponse {
    synced_ids: Vec<String>,
    entries: Vec<TimeEntry>,
}

// Command to save a time entry
#[tauri::command]
async fn save_time_entry(
    state: State<'_, AppState>,
    activity: String,
    elapsed: i64,
    description: Option<String>,
    tags: Vec<String>,
) -> Result<(), String> {
    let entry = TimeEntry::new(activity, elapsed, description, tags);
    schema::save_time_entry(&state.db_conn, &entry).map_err(|e| e.to_string())
}

// Command to get all time entries
#[tauri::command]
async fn get_all_time_entries(state: State<'_, AppState>) -> Result<Vec<TimeEntry>, String> {
    schema::get_all_time_entries(&state.db_conn).map_err(|e| e.to_string())
}

// Command to delete a time entry
#[tauri::command]
async fn delete_time_entry(state: State<'_, AppState>, id: String) -> Result<bool, String> {
    schema::delete_time_entry(&state.db_conn, &id).map_err(|e| e.to_string())
}

// Command to update a time entry
#[tauri::command]
async fn update_time_entry(
    state: State<'_, AppState>,
    id: String,
    activity: String,
    elapsed: i64,
    description: Option<String>,
    tags: Vec<String>,
    timestamp: String,
) -> Result<bool, String> {
    let entry = TimeEntry {
        id,
        activity,
        elapsed,
        description,
        tags,
        timestamp: chrono::DateTime::parse_from_rfc3339(&timestamp)
            .map(|dt| dt.with_timezone(&chrono::Utc))
            .map_err(|e| e.to_string())?,
        last_modified: chrono::Utc::now(),
        synced: false,
        sync_id: None,
        user_id: None,
    };

    schema::update_time_entry(&state.db_conn, &entry).map_err(|e| e.to_string())
}

/// Command to get unsynced entries
#[tauri::command]
async fn get_unsynced_entries(state: State<'_, AppState>) -> Result<Vec<TimeEntry>, String> {
    schema::get_unsynced_entries(&state.db_conn).map_err(|e| e.to_string())
}

/// Command to mark entries as synced
#[tauri::command]
async fn mark_entries_synced(
    state: State<'_, AppState>,
    ids: Vec<String>,
    sync_ids: Vec<Option<String>>,
) -> Result<(), String> {
    for (id, sync_id) in ids.iter().zip(sync_ids.iter()) {
        schema::mark_entry_synced(&state.db_conn, id, sync_id.as_ref().map(|s| s.clone()))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Command to sync with server
#[tauri::command]
async fn sync_with_server(
    state: State<'_, AppState>,
    token: String,
    server_url: String,
) -> Result<(), String> {
    let client = Client::new();

    // 1. Get unsynced entries
    let unsynced_entries =
        schema::get_unsynced_entries(&state.db_conn).map_err(|e| e.to_string())?;

    // 2. Send to server
    let response = client
        .post(format!("{}/api/sync", server_url))
        .header("Authorization", format!("Bearer {}", token))
        .json(&unsynced_entries)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 3. Get response with server changes
    let sync_response: SyncResponse = response.json().await.map_err(|e| e.to_string())?;

    // 4. Apply server changes
    for entry in sync_response.entries {
        schema::save_time_entry(&state.db_conn, &entry).map_err(|e| e.to_string())?;
    }

    // 5. Mark entries as synced
    for (id, sync_id) in sync_response
        .synced_ids
        .iter()
        .zip(sync_response.synced_ids.iter().map(|_| None))
    {
        schema::mark_entry_synced(&state.db_conn, id, sync_id.clone())
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database
            let db_conn = get_db_connection().expect("Failed to initialize database");

            // Manage application state
            app.manage(AppState { db_conn });

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_time_entry,
            get_all_time_entries,
            delete_time_entry,
            update_time_entry,
            get_unsynced_entries,
            mark_entries_synced,
            sync_with_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
