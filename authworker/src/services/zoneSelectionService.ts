import type { D1Database } from '@cloudflare/workers-types';
import { getCurrentTimeCST } from './timeContentService';

export async function updateUserZone(
  db: D1Database,
  userEmail: string,
  zoneId: number
): Promise<void> {
  try {
    console.log(`Preparing to update zone. User Email: ${userEmail}, Zone ID: ${zoneId}`);

    // Time-gated zone check (e.g., Tidal)
    const zoneTimeWindows: Record<number, { start: string; end: string }> = {
      5: { start: '10:00', end: '19:30' }, // Zone ID 5 = Tidal
    };

    const timeWindow = zoneTimeWindows[zoneId];
    if (timeWindow) {
      const now = getCurrentTimeCST();
      const [startH, startM] = timeWindow.start.split(':').map(Number);
      const [endH, endM] = timeWindow.end.split(':').map(Number);

      const start = new Date(now);
      start.setHours(startH, startM, 0, 0);

      const end = new Date(now);
      end.setHours(endH, endM, 0, 0);

      if (now < start || now > end) {
        throw new Error(`That zone is only available from ${timeWindow.start} to ${timeWindow.end} CST.`);
      }
    }

    const result = await db
      .prepare('UPDATE users SET current_zone_id = ? WHERE email = ?')
      .bind(zoneId, userEmail)
      .run();

    if (!result.success) {
      console.error('Failed to update user zone. Result:', result);
      throw new Error('Failed to update user zone');
    }

    console.log(`Successfully updated User Email ${userEmail} to Zone ID ${zoneId}`);
  } catch (error) {
    console.error('Error in updateUserZone:', error);
    throw error;
  }
}