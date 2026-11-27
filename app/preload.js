/**
 * Preload bridge. Exposes a deliberately small surface to the renderer:
 * native folder picking, revealing a file, and opening links. Everything else
 * goes through the local HTTP API.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aidentityDesktop", {
  isDesktop: true,
  platform: process.platform,
  chooseFolder: () => ipcRenderer.invoke("aidentity:choose-folder"),
  reveal: (target) => ipcRenderer.invoke("aidentity:reveal", target),
  openExternal: (url) => ipcRenderer.invoke("aidentity:open-external", url),
});
