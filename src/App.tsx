import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

type Status = "OKAY" | "ERROR" | "UNKNOWN";

const App = () => {
  const [status, setStatus] = useState<Status>("UNKNOWN");
  const [error, setError] = useState<string>("");

  const deskUpHandler = async () => {
    console.log("Desk up command invoked");
    try {
      const res = await invoke("cmd_up");
      setError("");
    } catch (e) {
      setError("Error calling command: " + e);
    }
  };

  const deskDownHandler = async () => {
    console.log("Desk down command invoked");
    try {
      const res = await invoke("cmd_down");
      setError("");
    } catch (e) {
      setError("Error calling command: " + e);
    }
  };

  const checkConnectionHandler = async () => {
    try {
      const res = await invoke("check_connection");
      if (res === "OKAY") {
        setStatus("OKAY");
        setError("");
      }
    } catch (e) {
      setStatus("ERROR");
      setError(String(e));
    }
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
