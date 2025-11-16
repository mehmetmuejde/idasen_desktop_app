use btleplug::api::{Central, Manager as _, ScanFilter, WriteType, Peripheral as _};
use btleplug::platform::{Manager, Peripheral};
use tokio::time::{sleep, Duration};
use uuid::Uuid;
use anyhow::Result;
use once_cell::sync::OnceCell;
use btleplug::api::Characteristic;

static DESK: OnceCell<Peripheral> = OnceCell::new();

const UUID_MOVE: &str = "99fa0002-338a-1024-8a49-009c0215f78a";

#[tauri::command]
async fn cmd_up() -> Result<(), String> {
    println!("CMD: Move UP");
    let desk = get_or_connect().await.map_err(|e| e.to_string())?;
    move_up(&desk).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_down() -> Result<(), String> {
    println!("CMD: Move DOWN");
    let desk = get_or_connect().await.map_err(|e| e.to_string())?;
    move_down(&desk).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_connection() -> Result<String, String> {
    // TODO-MMUEJDE: Heir sollten wir eine ART ENUM zurückgeben
    get_or_connect()
    .await
    .map(|_| "connected".into())
    .map_err(|_| "not_connected".into())
}

async fn get_or_connect() -> Result<&'static Peripheral> {
    if let Some(p) = DESK.get() {
        if p.is_connected().await.unwrap_or(false) {
            return Ok(p);
        }
    }
    let p = connect_to_desk().await?;
    DESK.set(p).ok();
    Ok(DESK.get().unwrap())
}

async fn move_up(p: &Peripheral) -> Result<()> {
    let uuid = Uuid::parse_str(UUID_MOVE)?;
    let characteristic = find_characteristic(p, uuid)?;

    let cmd = [0x47, 0x00];
    p.write(&characteristic, &cmd, WriteType::WithoutResponse).await?;
    println!("UP command sent");
    Ok(())
}

async fn move_down(p: &Peripheral) -> Result<()> {
    let uuid = Uuid::parse_str(UUID_MOVE)?;
    let characteristic = find_characteristic(p, uuid)?;

    let cmd = [0x46, 0x00];
    p.write(&characteristic, &cmd, WriteType::WithoutResponse).await?;
    println!("DOWN command sent");
    Ok(())
}

fn find_characteristic(p: &Peripheral, uuid: Uuid) -> Result<Characteristic> {
    let chars = p.characteristics();
    chars
        .iter()
        .find(|c| c.uuid == uuid)
        .cloned() // OWNED Kopie
        .ok_or_else(|| anyhow::anyhow!("Characteristic not found: {}", uuid))
}

async fn connect_to_desk() -> Result<Peripheral> {
    let manager = Manager::new().await?;
    let adapter = manager.adapters().await?.into_iter().next()
        .ok_or_else(|| anyhow::anyhow!("No Bluetooth adapter"))?;

    adapter.start_scan(ScanFilter::default()).await?;
    sleep(Duration::from_secs(2)).await;

    let peripherals = adapter.peripherals().await?;

    for p in peripherals {
        if let Ok(props_opt) = p.properties().await {
            if let Some(props) = props_opt {
                if let Some(name) = props.local_name.clone() {
                    if name.starts_with("Desk") {
                        println!("Connected to desk: {}", name);
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
        .invoke_handler(tauri::generate_handler![
            cmd_up,
            cmd_down,
            check_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}