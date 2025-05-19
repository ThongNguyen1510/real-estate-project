/**
 * Utility functions for image handling
 */

/**
 * Resolves an image path to its absolute URL using PUBLIC_URL
 * @param relativePath The relative path to the image from the public directory
 * @returns The absolute URL to the image
 */
export const getImageUrl = (relativePath: string): string => {
  const baseUrl = process.env.PUBLIC_URL || '';
  // Ensure path starts with a slash
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${baseUrl}${normalizedPath}`;
}; 