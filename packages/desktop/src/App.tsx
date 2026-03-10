const EXCLUSIVE_FEATURES = [
  { key: "menubar", label: "Menubar", description: "Always-on menubar for instant access" },
  { key: "context", label: "App Context Awareness", description: "Detect active app and infer context" },
  { key: "clipboard", label: "Clipboard Watcher", description: "Capture clipboard content with confirmation" },
  { key: "focus", label: "System Focus Mode", description: "Native DND integration for deep work" },
  { key: "notifications", label: "Native Notifications", description: "OS-level reminders and alerts" },
  { key: "cmdk", label: "Global \u2318K", description: "System-wide quick capture shortcut" },
] as const;

function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Ask Dorian Desktop
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Coming Soon</p>

      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
        6 Desktop-Exclusive Features
      </h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
        {EXCLUSIVE_FEATURES.map((f) => (
          <li key={f.key} style={{ padding: "0.75rem 1rem", border: "1px solid #e5e5e5", borderRadius: 8 }}>
            <strong>{f.label}</strong>
            <span style={{ color: "#888", marginLeft: "0.5rem" }}>{f.description}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
