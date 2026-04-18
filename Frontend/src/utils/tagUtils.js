/**
 * Safely parse project tags from various formats
 * @param {any} tags - The tags data (could be array, string, or other)
 * @returns {Array} - Always returns an array of tags
 */
export function parseProjectTags(tags) {
  // Return empty array if no tags
  if (!tags) {
    return [];
  }

  // If already an array, return as is
  if (Array.isArray(tags)) {
    return tags;
  }

  // If string, try to parse as JSON first
  if (typeof tags === "string") {
    const trimmed = tags.trim();
    if (!trimmed) {
      return [];
    }

    // Try JSON parsing first
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If parsed but not array, treat as single tag
      return [parsed];
    } catch (error) {
      // If JSON parsing fails, treat as single string tag
      return [trimmed];
    }
  }

  // For any other type, convert to string and return as single tag
  return [String(tags)];
}

/**
 * Format tags for display with a limit
 * @param {any} tags - The tags data
 * @param {number} limit - Maximum number of tags to display (default: 4)
 * @returns {Object} - Object with displayTags array and hasMore boolean
 */
export function formatTagsForDisplay(tags, limit = 4) {
  const parsedTags = parseProjectTags(tags);

  return {
    displayTags: parsedTags.slice(0, limit),
    hasMore: parsedTags.length > limit,
    totalCount: parsedTags.length,
    remainingCount: Math.max(0, parsedTags.length - limit),
  };
}

/**
 * Search within tags for a query string
 * @param {any} tags - The tags data
 * @param {string} query - Search query
 * @returns {boolean} - True if query found in any tag
 */
export function searchInTags(tags, query) {
  const parsedTags = parseProjectTags(tags);
  const lowerQuery = query.toLowerCase();

  return parsedTags.some((tag) =>
    String(tag).toLowerCase().includes(lowerQuery),
  );
}
