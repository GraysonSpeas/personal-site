export async function updateUserZone(
  db: D1Database,
  userEmail: string, // Updated parameter to reflect email
  zoneId: number
): Promise<void> {
  try {
    console.log(`Preparing to update zone. User Email: ${userEmail}, Zone ID: ${zoneId}`);

    const result = await db
      .prepare('UPDATE users SET current_zone_id = ? WHERE email = ?') // Use 'email' column
      .bind(zoneId, userEmail) // Bind zoneId and userEmail
      .run();

    if (result.success !== true) {
      console.error('Failed to update user zone. Result:', result);
      throw new Error('Failed to update user zone');
    }

    console.log(`Successfully updated User Email ${userEmail} to Zone ID ${zoneId}`);
  } catch (error) {
    console.error('Error in updateUserZone:', error);
    throw error;
  }
}