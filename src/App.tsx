import {
  Button,
  Center,
  Container,
  Group,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
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
      console.log(res);
      setError("");
    } catch (e) {
      setError("Error calling command: " + e);
    }
  };

  const deskDownHandler = async () => {
    console.log("Desk down command invoked");
    try {
      const res = await invoke("cmd_down");
      console.log(res);
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
    <Container>
      <Center>
        <img src="icon.png" alt="IKEA Idasen Logo" height={150} />
      </Center>
      <Center my="xl">
        <Title>IKEA Idasen App</Title>
      </Center>
      <Group justify="center">
        <Button onClick={deskUpHandler} leftSection={<IconPlus />}>
          Up
        </Button>
        <TextInput placeholder="Height in cm" />
        <Button onClick={deskDownHandler} leftSection={<IconMinus />}>
          Down
        </Button>
      </Group>
      <Stack align="center" mt="xl">
        <Title order={3}>Desk Status</Title>
        <pre>status: {status}</pre>
        {error && <pre>{error}</pre>}
        <Button onClick={checkConnectionHandler}>Status abfragen</Button>
      </Stack>
    </Container>
  );
};

export default App;
