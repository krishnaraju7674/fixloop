/**
 * Single source of truth for personal details.
 * Swap these two values and the whole page updates.
 */
export const AUTHOR = {
  name: "G Krishnam Raju",
  role: "3rd-year IT student · built FixLoop end-to-end",
};

export const CONTACT = {
  email: "gkr.7674@gmail.com",
  mailto: (subject: string) =>
    `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`,
};
