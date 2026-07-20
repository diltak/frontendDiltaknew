/**
 * Pure helper functions for the landing page redesign.
 * Extracted for property-based testability.
 *
 * Requirements: 1.8, 15.4, 15.5
 */

// ─── Contact Form ─────────────────────────────────────────────────────────────

export interface ContactFormErrors {
  name?: string;
  email?: string;
  email_format?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the required fields of the contact form.
 *
 * Rules:
 * - `name` is required
 * - `email` is required and must match the EMAIL_REGEX pattern
 * - `message` is required
 *
 * Returns a partial errors object — empty object means validation passed.
 */
export function validateContactForm(fields: {
  name: string;
  email: string;
  message: string;
}): Partial<ContactFormErrors> {
  const errors: Partial<ContactFormErrors> = {};

  if (!fields.name.trim()) {
    errors.name = "Name is required";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email_format = "Please enter a valid email address";
  }

  if (!fields.message.trim()) {
    errors.message = "Message is required";
  }

  return errors;
}

// ─── Stagger Animation ────────────────────────────────────────────────────────

/**
 * Returns the Framer Motion stagger delay for an element at a given array index.
 *
 * `delay = index × multiplier`
 *
 * Examples:
 * - How It Works steps use multiplier 0.15
 * - Feature cards (Saathi / Umang) use multiplier 0.10
 */
export function getStepDelay(index: number, multiplier: number): number {
  return index * multiplier;
}

// ─── Mobile Menu Accessibility ────────────────────────────────────────────────

/**
 * Returns the `aria-label` value for the mobile menu toggle button.
 *
 * - `true`  (menu open)  → "Close menu"
 * - `false` (menu closed) → "Open menu"
 */
export function getMobileToggleAriaLabel(isOpen: boolean): string {
  return isOpen ? "Close menu" : "Open menu";
}
