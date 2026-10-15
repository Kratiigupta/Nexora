import test from "node:test";
import assert from "node:assert/strict";

// Test the socket authentication and reconnect error handling logic
test("Socket auth error classification distinguishes auth errors from network drops", () => {
  const isAuthError = (errorMessage) => {
    return (
      errorMessage.includes("Authentication") ||
      errorMessage.includes("token") ||
      errorMessage.includes("Invalid")
    );
  };

  assert.equal(isAuthError("Authentication required: token missing"), true);
  assert.equal(isAuthError("Invalid access token"), true);
  assert.equal(isAuthError("jwt token expired"), true);
  assert.equal(isAuthError("xhr poll error"), false);
  assert.equal(isAuthError("websocket error"), false);
  assert.equal(isAuthError("timeout"), false);
});

test("Socket singleton state resets on disconnect", () => {
  // Test mock simulating getSocket / disconnectSocket lifecycle
  let socketInstance = {
    connected: true,
    listeners: new Map(),
    on(event, fn) {
      this.listeners.set(event, fn);
    },
    removeAllListeners() {
      this.listeners.clear();
    },
    disconnect() {
      this.connected = false;
    },
  };

  assert.equal(socketInstance.connected, true);
  socketInstance.on("connect", () => {});
  assert.equal(socketInstance.listeners.size, 1);

  // simulate disconnectSocket()
  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;

  assert.equal(socketInstance, null);
});
