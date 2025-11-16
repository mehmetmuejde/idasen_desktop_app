import {
  ActionIcon,
  Box,
  Container,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconHome,
  IconMessageCircle,
  IconMinimize,
  IconMinus,
  IconPlus,
  IconPointFilled,
  IconSettings,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

const win = getCurrentWindow();

type Status = "OKAY" | "ERROR" | "UNKNOWN";

const App = () => {
  const [status, setStatus] = useState<Status>("UNKNOWN");
  const [error, setError] = useState<string>("");
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    // TODO-MMUEJDE: Cleanup listener on unmount
    const unlisten = listen<number>("height_update", (event) => {
      console.log("Height:", event.payload);
      setHeight(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const deskUpHandler = async () => {
    console.log("Desk up command invoked");
    try {
      const res = await invoke("cmd_up");
      console.log(res);
      setStatus("OKAY");
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
      setStatus("OKAY");
      setError("");
    } catch (e) {
      setError("Error calling command: " + e);
    }
  };

  // const checkConnectionHandler = async () => {
  //   try {
  //     const res = await invoke("check_connection");
  //     if (res === "OKAY") {
  //       setStatus("OKAY");
  //       setError("");
  //     }
  //   } catch (e) {
  //     setStatus("ERROR");
  //     setError(String(e));
  //   }
  // };

  const closeAppHandler = async () => {
    console.log("Close app command invoked");
    await win.close().then(() => {
      console.log("Window closed");
    });
  };

  const minimizeAppHandler = async () => {
    console.log("Minimize app command invoked");
    await win.minimize().then(() => {
      console.log("Window minimized");
    });
  };

  return (
    <Container p={0} pos="relative">
      <Group
        // TODO-MMUEJDE: static oder fixed?
        justify="space-between"
        data-tauri-drag-region
        p="xs"
        pos="static"
        top={0}
        left={0}
        right={0}
      >
        <Group>
          <img src="icon.png" alt="Idasen Logo" width={32} height={32} />
          <Title order={3}>Idasen Desktop App</Title>
        </Group>
        <Group gap={5}>
          <ActionIcon onClick={minimizeAppHandler} color="orange" radius={50}>
            <IconMinimize size={16} />
          </ActionIcon>
          <ActionIcon onClick={closeAppHandler} color="red" radius={50}>
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <Divider />
      <Box>
        <Tabs defaultValue="home" variant="default" mb="xl">
          <Tabs.List>
            <Tabs.Tab value="home" leftSection={<IconHome size={12} />}>
              Home
            </Tabs.Tab>
            <Tabs.Tab
              value="logs"
              leftSection={<IconMessageCircle size={12} />}
            >
              Logs
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
              Settings
            </Tabs.Tab>
            <Tabs.Tab value="about" leftSection={<IconUser size={12} />}>
              About
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="home">
            <Stack></Stack>
            <Group mt="xl" justify="center">
              <ActionIcon onClick={deskUpHandler} size="xl">
                <IconPlus />
              </ActionIcon>
              <TextInput
                placeholder="Height in cm"
                style={{ maxWidth: 80 }}
                rightSection="cm"
                value={height}
                size="md"
                readOnly
              />
              <ActionIcon onClick={deskDownHandler} size="xl">
                <IconMinus />
              </ActionIcon>
            </Group>
          </Tabs.Panel>
          <Tabs.Panel value="logs">
            <ScrollArea h={250}>Hier kommen die Logs hin.</ScrollArea>
          </Tabs.Panel>
          <Tabs.Panel value="settings">Settings will go here.</Tabs.Panel>
          <Tabs.Panel value="about">
            <Stack align="center">
              <p
              // TODO-MMUEJDE: Version lesen wir aus Cargo.toml oder ENV per CI/CD
              >
                Version: 0.1.0
              </p>
              <p>Developed by Mehmet Muejde.</p>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Box>
      <Group
        justify="space-between"
        pos="fixed"
        bottom={0}
        left={0}
        right={0}
        px="xs"
        style={{
          borderTop: "1px solid #ccc",
        }}
      >
        <Group gap={0}>
          {error ? (
            <IconPointFilled color="red" size={28} />
          ) : (
            <IconPointFilled color="green" size={28} />
          )}
          <Text>Connected to Idasen Desk</Text>
        </Group>
        <Text>Status: {status}</Text>
      </Group>
    </Container>
  );
};

export default App;
