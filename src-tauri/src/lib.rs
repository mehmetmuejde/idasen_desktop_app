use btleplug::api::{Central, Manager as _, ScanFilter, WriteType};
use btleplug::platform::Manager;
use tokio::time::{sleep, Duration};
use uuid::Uuid;
use anyhow::Result;
use btleplug::api::Peripheral;

// LINAK Movement UUID
const UUID_MOVE: &str = "99fa0002-338a-1024-8a49-009c0215f78a";

#[tauri::command]
async fn cmd_up() -> Result<(), String> {
    println!("CMD: Move UP");
    move_direction(true).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_down() -> Result<(), String> {
    println!("CMD: Move DOWN");
    move_direction(false).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_connection() -> Result<String, String> {
    match connect_to_desk().await {
        Ok(_) => Ok("connected".into()),
        Err(_) => Err("not_connected".into()),
    }
}

async fn move_direction(up: bool) -> Result<()> {
    let desk = connect_to_desk().await?;
    if up {
        move_up(&desk).await?;
    } else {
        move_down(&desk).await?;
    }
    Ok(())
}

async fn move_up(p: &impl Peripheral) -> Result<()> {
    let uuid = Uuid::parse_str(UUID_MOVE)?;
    let chars = p.characteristics();
    let c = chars.iter()
        .find(|x| x.uuid == uuid)
        .ok_or_else(|| anyhow::anyhow!("Move characteristic not found"))?;

    let cmd = [0x47, 0x00]; // LINAK MOVE UP
    p.write(c, &cmd, WriteType::WithoutResponse).await?;
    println!("UP command sent (WriteWithoutResponse)");
    Ok(())
}

async fn move_down(p: &impl Peripheral) -> Result<()> {
    let uuid = Uuid::parse_str(UUID_MOVE)?;
    let chars = p.characteristics();
    let c = chars.iter()
        .find(|x| x.uuid == uuid)
        .ok_or_else(|| anyhow::anyhow!("Move characteristic not found"))?;

    let cmd = [0x46, 0x00]; // LINAK MOVE DOWN
    p.write(c, &cmd, WriteType::WithoutResponse).await?;
    println!("DOWN command sent (WriteWithoutResponse)");
    Ok(())
}

async fn connect_to_desk() -> Result<impl Peripheral> {
    let manager = Manager::new().await?;
    let adapter = manager.adapters().await?.into_iter().next()
        .expect("No Bluetooth adapter");

    adapter.start_scan(ScanFilter::default()).await?;
    sleep(Duration::from_secs(2)).await;

    let peripherals = adapter.peripherals().await?;

    for p in peripherals {
        if let Ok(props_opt) = p.properties().await {
            if let Some(props) = props_opt {
                if let Some(name) = props.local_name.clone() {
                    if name.starts_with("Desk") {
                        println!("Found desk: {}", name);
                        p.connect().await?;
                        p.discover_services().await?;
                        return Ok(p);
                    }
                }
            }
        }
    }

    Err(anyhow::anyhow!("Desk 5440 not found"))
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