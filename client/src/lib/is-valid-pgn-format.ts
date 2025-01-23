/**
 * Validates whether a string is in valid PGN (Portable Game Notation) format.
 * Checks for required tags, move text, and basic structural elements.
 *
 * @param pgnString - The string to validate
 * @returns boolean - True if the string is in valid PGN format, false otherwise
 */
export function isValidPgnFormat(pgnString: string): boolean {
  if (!pgnString || typeof pgnString !== "string") {
    return false;
  }

  // Trim whitespace
  const pgn = pgnString.trim();

  // Check for required Seven Tag Roster (STR)
  const requiredTags = [
    '[Event "',
    '[Site "',
    '[Date "',
    '[Round "',
    '[White "',
    '[Black "',
    '[Result "',
  ];

  // All required tags must be present
  const hasAllRequiredTags = requiredTags.every((tag) => pgn.includes(tag));
  if (!hasAllRequiredTags) {
    return false;
  }

  // Check for valid tag format
  const tagPattern = /\[\s*\w+\s+"[^"]*"\s*\]/;
  const tagLines = pgn
    .split("\n")
    .filter((line) => line.trim().startsWith("["));
  const hasValidTagFormat = tagLines.every((line) =>
    tagPattern.test(line.trim())
  );
  if (!hasValidTagFormat) {
    return false;
  }

  // Check for valid result
  const validResults = ["1-0", "0-1", "1/2-1/2", "*"];
  const hasValidResult = validResults.some((result) => pgn.includes(result));
  if (!hasValidResult) {
    return false;
  }

  // Check for move text
  // Basic move pattern: number followed by one or two moves
  // Example: "1. e4 e5" or "1... e5" or "1. e4"
  const movePattern = /\d+\.+\s*([a-zA-Z][a-zA-Z0-9+#=]+\s*)+/;
  const hasMoves = movePattern.test(pgn);
  if (!hasMoves) {
    return false;
  }

  // Check for basic structural integrity
  // - Should have alternating moves after numbers
  // - Should have proper spacing between moves
  // - Should end with a valid result
  const moveText = pgn
    .split("\n")
    .filter((line) => !line.trim().startsWith("["))
    .join(" ")
    .trim();

  const structurePattern =
    /^\s*(\d+\.\s+[a-zA-Z][a-zA-Z0-9+#=]+\s+([a-zA-Z][a-zA-Z0-9+#=]+\s+)?)*([0-1]|-|\/|\*)/;
  const hasValidStructure = structurePattern.test(moveText);
  if (!hasValidStructure) {
    return false;
  }

  return true;
}
