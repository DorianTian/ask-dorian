import { AppRegistry } from "react-native"
import App from "./App"

// React Native Web's AppRegistry injects necessary CSS resets
// (height: 100%, box-sizing: border-box, etc.)
AppRegistry.registerComponent("AskDorian", () => App)
AppRegistry.runApplication("AskDorian", {
  rootTag: document.getElementById("root"),
})
