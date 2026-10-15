/**
 * Classify whether a socket connection error is an authentication error
 * (as opposed to a network error like timeout or connection refused).
 *
 * Extracted to a standalone module so it can be:
 * 1. Imported from socket.ts without circular dependencies
 * 2. Directly tested by Node.js test runner without Next.js/Supabase
 */
export const isAuthError = (errorMessage: string): boolean => {
  return (
    errorMessage.includes("Authentication") ||
    errorMessage.includes("token") ||
    errorMessage.includes("Invalid")
  );
};

export const MAX_AUTH_RETRIES = 3;
