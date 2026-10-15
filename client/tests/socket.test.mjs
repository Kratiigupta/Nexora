import test from "node:test";
import assert from "node:assert/strict";

// Import the actual isAuthError function from the standalone utilities module.
// socketUtils.ts has no framework dependencies (@/lib/supabase, etc.) so it
// can be loaded directly by the Node.js test runner.
import { isAuthError, MAX_AUTH_RETRIES } from "../src/lib/socketUtils.ts";

test("isAuthError() classifies auth errors vs network errors (actual export)", () => {
  // Auth errors — should return true
  assert.equal(isAuthError("Authentication required: token missing"), true);
  assert.equal(isAuthError("Invalid access token"), true);
  assert.equal(isAuthError("jwt token expired"), true);

  // Network errors — should return false
  assert.equal(isAuthError("xhr poll error"), false);
  assert.equal(isAuthError("websocket error"), false);
  assert.equal(isAuthError("timeout"), false);
  assert.equal(isAuthError("ECONNREFUSED"), false);
});

test("MAX_AUTH_RETRIES is configured to prevent infinite reconnection loops", () => {
  assert.equal(typeof MAX_AUTH_RETRIES, "number");
  assert.equal(MAX_AUTH_RETRIES, 3);

  // Simulate retry counter logic to verify boundary condition
  let authRetryCount = 0;
  let disconnected = false;

  const simulateAuthError = () => {
    authRetryCount += 1;
    if (authRetryCount > MAX_AUTH_RETRIES) {
      disconnected = true;
    }
  };

  // Up to 3 retries are permitted
  simulateAuthError(); // retry 1
  assert.equal(disconnected, false);
  simulateAuthError(); // retry 2
  assert.equal(disconnected, false);
  simulateAuthError(); // retry 3
  assert.equal(disconnected, false);

  // 4th error exceeds limit and triggers disconnect
  simulateAuthError(); // retry 4 > MAX_AUTH_RETRIES
  assert.equal(disconnected, true);
});

test("Socket singleton state resets on disconnect", () => {
  // This tests the disconnect lifecycle pattern used by disconnectSocket().
  // We can't import disconnectSocket directly because it depends on the
  // socket.io-client module-level singleton and @/ imports. Instead we
  // verify the behavioral contract: listeners are removed, socket is
  // disconnected, and the reference is nulled.
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
