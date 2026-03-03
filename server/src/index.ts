import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

// Starts the HTTP server on the configured local port.
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
