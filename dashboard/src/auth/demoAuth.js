/**
 * GramCare AI - Demo Authentication Module
 * Predefined demo-only credentials for local hackathon evaluation.
 *
 * SECURITY BOUNDARY & INTEGRITY NOTE:
 * This module is for demonstration and testing purposes only.
 * Client-side credential validation cannot protect real patient data
 * and can be inspected or bypassed using browser developer tools.
 * DO NOT commit real production passwords, API keys, or secrets.
 */

export const DEMO_CREDENTIALS = {
  userId: 'officer01',
  password: 'GramCare@2026!',
  name: 'Dr. Surveillance Officer',
  role: 'Medical Authority / Surveillance Lead',
  department: 'Rural Health Surveillance Unit',
};

const SESSION_KEY = 'gramcare_demo_auth_session';

/**
 * Validates user credentials against demo baseline.
 * @param {string} userId
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function loginDemoUser(userId, password) {
  // Simulate minor network/crypto latency for realistic UI state
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!userId || !password) {
    return {
      success: false,
      error: 'Please enter both User ID and Password.',
    };
  }

  const trimmedId = userId.trim();

  if (trimmedId === DEMO_CREDENTIALS.userId && password === DEMO_CREDENTIALS.password) {
    const sessionUser = {
      id: DEMO_CREDENTIALS.userId,
      name: DEMO_CREDENTIALS.name,
      role: DEMO_CREDENTIALS.role,
      department: DEMO_CREDENTIALS.department,
      loginTime: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    } catch {
      // Ignore storage errors in environments where sessionStorage is disabled
    }

    return {
      success: true,
      user: sessionUser,
    };
  }

  return {
    success: false,
    error: 'Invalid User ID or Password. Please try again.',
  };
}

/**
 * Retrieves current active session if valid.
 * Does NOT persist or store passwords.
 */
export function getActiveSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Clears active session on logout.
 */
export function logoutDemoUser() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore error
  }
}
