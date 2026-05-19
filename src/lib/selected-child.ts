/**
 * Manages the selected active child profile ID in localStorage.
 *
 * This allows the app to remember which child profile the parent
 * is currently managing, even after page refresh.
 *
 * The selected child profile ID is stored per-parent (by auth user ID)
 * so that multiple parents on the same device don't interfere.
 *
 * localStorage key format:
 *   children-go-app:v0.2:selected-child:{parentUserId}
 */

const STORAGE_KEY_PREFIX = "children-go-app:v0.2:selected-child";

/**
 * Returns the localStorage key for a given parent user ID.
 */
function getStorageKey(parentUserId: string): string {
  return `${STORAGE_KEY_PREFIX}:${parentUserId}`;
}

/**
 * Gets the selected child profile ID for the current parent.
 * Returns null if no child is selected or if not authenticated.
 */
export function getSelectedChildProfileId(parentUserId: string | null): string | null {
  if (!parentUserId) return null;
  try {
    return localStorage.getItem(getStorageKey(parentUserId));
  } catch {
    return null;
  }
}

/**
 * Sets the selected child profile ID for the current parent.
 */
export function setSelectedChildProfileId(
  parentUserId: string,
  childProfileId: string,
): void {
  try {
    localStorage.setItem(getStorageKey(parentUserId), childProfileId);
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Clears the selected child profile ID for the current parent.
 */
export function clearSelectedChildProfileId(parentUserId: string): void {
  try {
    localStorage.removeItem(getStorageKey(parentUserId));
  } catch {
    // silently ignore
  }
}
