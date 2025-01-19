export default function getEmailInitials(email: string): string {
  if (!email.includes("@")) {
    throw new Error("Invalid email format");
  }

  // Extract the part before the @
  const namePart = email.split("@")[0];

  // Get the first two letters, capitalizing the first one
  const firstLetter = namePart.charAt(0).toUpperCase();
  const secondLetter = namePart.length > 1 ? namePart.charAt(1) : "";

  return firstLetter + secondLetter;
}
