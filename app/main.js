/**
 * Aidentity desktop app — Electron main process.
 *
 * Starts the local server in-process, then loads it in a window. No remote
 * content, no telemetry, no network access beyond the loopback interface.
 */

const path = require("path");
const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const { createServer } = require("./server");

app.setName("Aidentity");
app.setPath("userData", `${process.env.HOME}/Library/Application Support/Aidentity`);

const PORT = Number(process.env.AIDENTITY_PORT) || 7419;
let server;
let token;
let ctx;

function createWindow(url) {
  const win = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 940,
    minHeight: 620,
    backgroundColor: "#f7f4ed",
    icon: path.join(__dirname, "icon.png"),
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  win.loadURL(url);

  // Open external links in the user's browser, never inside the app shell.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:/.test(target)) shell.openExternal(target);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, target) => {
    if (!target.startsWith(`http://127.0.0.1:${PORT}`)) {
      event.preventDefault();
      shell.openExternal(target);
    }
  });

  return win;
}

app.whenReady().then(() => {
  const cwd = process.env.AIDENTITY_CWD || process.cwd();
  const created = createServer({ cwd });
  server = created.server;
  token = created.token;
  ctx = created.ctx;

  server.listen(PORT, "127.0.0.1", () => {
    createWindow(`http://127.0.0.1:${PORT}/?token=${token}`);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(`http://127.0.0.1:${PORT}/?token=${token}`);
    }
  });
});

// Native helpers the renderer cannot do from a sandboxed page.
ipcMain.handle("aidentity:choose-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
  if (result.canceled || !result.filePaths.length) return null;
  ctx.cwd = result.filePaths[0];
  return ctx.cwd;
});

ipcMain.handle("aidentity:reveal", async (_event, target) => {
  if (typeof target === "string" && target) shell.showItemInFolder(target);
});

ipcMain.handle("aidentity:open-external", async (_event, url) => {
  if (typeof url === "string" && /^https?:/.test(url)) await shell.openExternal(url);
});

app.on("window-all-closed", () => {
  if (server) server.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (server) server.close();
});
