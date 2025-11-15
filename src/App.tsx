import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

type Status = "OKAY" | "ERROR" | "UNKNOWN"

const App = () => {
  const [status, setStatus] = useState<Status>("UNKNOWN");
  const [error, setError] = useState<string>("");

  const deskUpHandler = async () => {
    await invoke("cmd_up");
  };

  const deskDownHandler = async () => {
    await invoke("cmd_down");
  };

  const checkConnectionHandler = async () => {
    await invoke("check_connection").then((res) => setStatus(res as Status)).catch((e) => { 
      setError(e.toString());
      setStatus("ERROR");
    });
  };

  return (
    <main className="container">
      <h1>IKEA Idasen App</h1>
      <button onClick={deskUpHandler}>Desk Up</button>
      <button onClick={deskDownHandler}>Desk Down</button>
      <h3>Status</h3>
      <pre>{status}</pre>
      <pre>{error}</pre>
      <button onClick={checkConnectionHandler}>Get Status</button>
    </main>
  );
};

export default App;
