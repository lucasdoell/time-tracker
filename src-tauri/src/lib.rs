mod db;

use db::{get_db_connection, schema, TimeEntry};
use tauri::Manager;
use tauri::State;

struct AppState {
    db_conn: db::DbConnection,
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
    };

    schema::update_time_entry(&state.db_conn, &entry).map_err(|e| e.to_string())
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
            update_time_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
