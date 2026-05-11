import { SDKProvider, useSDK, EmbedStyle } from "@genuin/web-sdk";
import type { EmbedConfig } from "@genuin/web-sdk";
import React, { useState } from "react";

function EmbedExample() {
  const [style, setStyle] = useState<EmbedStyle>(EmbedStyle.FEED);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { error } = useSDK();

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="embed-example">
      <div className="controls">
        <h3>Embed Controls</h3>

        <div className="control-group">
          <label>Style:</label>
          <select value={style} onChange={(e) => setStyle(e.target.value as EmbedStyle)}>
            <option value={EmbedStyle.FEED}>Feed</option>
            <option value={EmbedStyle.CAROUSEL}>Carousel</option>
            <option value={EmbedStyle.STANDARD_WALL}>Standard Wall</option>
            <option value={EmbedStyle.FLOATING}>Floating</option>
          </select>
        </div>

        <div className="control-group">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div id="genuin-embed" className="embed-container" />
    </div>
  );
}

function App() {
  const embedConfig: EmbedConfig = {
    elementId: "genuin-embed",
    style: EmbedStyle.FEED,
    theme: "light",
    showHeader: true,
    allowInteractions: true,
    maxHeight: 600,
    autoResize: true,
  };

  return (
    <SDKProvider initialConfig={embedConfig}>
      <div className="app">
        <header>
          <h1>Genuin Web SDK - React Example</h1>
          <p>Basic usage of Genuin embeds in React</p>
        </header>

        <main>
          <EmbedExample />
        </main>
      </div>
    </SDKProvider>
  );
}

export default App;
