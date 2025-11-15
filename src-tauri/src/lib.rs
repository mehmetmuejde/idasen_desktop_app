use btleplug::api::{Central, Manager as _, ScanFilter, WriteType};
use btleplug::platform::Manager;
use tokio::time::{sleep, Duration};
use uuid::Uuid;
use anyhow::Result;
use btleplug::api::Peripheral;

// BLE UUIDs for IDÅSEN Desk
const HEIGHT_WRITE_UUID: &str = "00001524-1212-efde-1523-785feabcd123";

#[tauri::command]
async fn cmd_up() -> Result<(), String> {
    log::info!("Moving up...");
    move_direction(true).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_down() -> Result<(), String> {
    log::info!("Moving down...");
    move_direction(false).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_connection() -> Result<String, String> {
    match connect_to_desk().await {
        Ok(_) => Ok("connected".into()),
        Err(e) => Err(format!("not_connected: {}", e)),
    }
}

async fn move_direction(up: bool) -> Result<()> {
    let desk = connect_to_desk().await?;
    let target = if up { 65_535u16 } else { 0u16 };
    write_height(&desk, target).await?;
    Ok(())
}

async fn connect_to_desk() -> Result<impl Peripheral> {
    let manager = Manager::new().await?;
    let adapter = manager.adapters().await?.into_iter().next().unwrap();

    adapter.start_scan(ScanFilter::default()).await?;
    sleep(Duration::from_secs(2)).await;

    let peripherals = adapter.peripherals().await?;

    for p in peripherals {
        if let Ok(props_opt) = p.properties().await {
            if let Some(props) = props_opt {
                if let Some(name) = props.local_name {
                    if name.contains("Desk") {
                        p.connect().await?;
                        p.discover_services().await?;
                        return Ok(p);
                    }
                }
            }
        }
    }

    Err(anyhow::anyhow!("IDÅSEN desk not found"))
}

async fn write_height(desk: &impl btleplug::api::Peripheral, mm: u16) -> Result<()> {
    let uuid = Uuid::parse_str(HEIGHT_WRITE_UUID)?;
    let chars = desk.characteristics();
    let c = chars.iter().find(|c| c.uuid == uuid)
        .ok_or_else(|| anyhow::anyhow!("height write characteristic not found"))?;

    let bytes = mm.to_le_bytes();
    desk.write(c, &bytes, WriteType::WithResponse).await?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            cmd_up,
            cmd_down,
            check_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
