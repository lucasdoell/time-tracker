use chrono::{DateTime, Utc};
use rusqlite::{Result as SqliteResult, Row};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeEntry {
    pub id: String,
    pub activity: String,
    pub elapsed: i64,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub timestamp: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
    pub synced: bool,
    pub sync_id: Option<String>,
    pub user_id: Option<String>,
}

impl TimeEntry {
    pub fn new(
        activity: String,
        elapsed: i64,
        description: Option<String>,
        tags: Vec<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            activity,
            elapsed,
            description,
            tags,
            timestamp: Utc::now(),
            last_modified: Utc::now(),
            synced: false,
            sync_id: None,
            user_id: None,
        }
    }

    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        let id: String = row.get(0)?;
        let activity: String = row.get(1)?;
        let elapsed: i64 = row.get(2)?;
        let description: Option<String> = row.get(3)?;
        let timestamp_str: String = row.get(4)?;
        let tags_json: String = row.get(5)?;
        let last_modified_str: String = row.get(6)?;
        let synced: i64 = row.get(7)?;
        let sync_id: Option<String> = row.get(8)?;
        let user_id: Option<String> = row.get(9)?;

        let timestamp = DateTime::parse_from_rfc3339(&timestamp_str)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());

        let last_modified = DateTime::parse_from_rfc3339(&last_modified_str)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());

        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        Ok(TimeEntry {
            id,
            activity,
            elapsed,
            description,
            tags,
            timestamp,
            last_modified,
            synced: synced != 0,
            sync_id,
            user_id,
        })
    }

    pub fn to_params(
        &self,
    ) -> (
        String,
        String,
        i64,
        Option<String>,
        String,
        String,
        String,
        i64,
        Option<String>,
        Option<String>,
    ) {
        let tags_json = serde_json::to_string(&self.tags).unwrap_or_else(|_| "[]".to_string());
        let timestamp_str = self.timestamp.to_rfc3339();
        let last_modified_str = self.last_modified.to_rfc3339();

        (
            self.id.clone(),
            self.activity.clone(),
            self.elapsed,
            self.description.clone(),
            timestamp_str,
            tags_json,
            last_modified_str,
            if self.synced { 1 } else { 0 },
            self.sync_id.clone(),
            self.user_id.clone(),
        )
    }
}
