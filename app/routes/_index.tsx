import type { V2_MetaFunction } from "partymix";
import usePartySocket from "partysocket/react";
import { useState } from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Partymix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const App = () => {
  const [messages, setMessages] = useState<string[]>([]);
  // A PartySocket is like a WebSocket, except it's a bit more magical.
  // It handles reconnection logic, buffering messages while it's offline, and more.
  usePartySocket({
    host: "localhost:1999",
    room: "test-room:jevakallio",
    party: "scope",
    onOpen() {
      setMessages((messages) => [...messages, "Connected!"]);
    },
    onMessage(event) {
      setMessages((messages) => [...messages, event.data]);
    },
    onClose() {
      setMessages((messages) => [...messages, "Closed!"]);
    },
  });

  return (
    <ul>
      {messages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  );
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>🎈 PartyKit ⤫ Remix 💿 </h1>
      <App />
    </div>
  );
}
