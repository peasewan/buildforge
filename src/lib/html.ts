/**
 * Shared by every prerender script. These scripts build one site's HTML, so a
 * difference in escaping between them is a difference in shipped output.
 */
export const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
