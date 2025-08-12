import type { D1Database } from '@cloudflare/workers-types';
import { getCurrentTimeCST } from './timeContentService';

export async function updateUserZone(
  db: D1Database,
  userEmail: string,
  zoneId: number
): Promise<void> {
  try {
    console.log(`Preparing to update zone. User Email: ${userEmail}, Zone ID: ${zoneId}`);

    // Define multiple time windows for zones that have restrictions
    const zoneTimeWindows: Record<number, { start: string; end: string }[]> = {
      5: [
        { start: '10:00', end: '11:30' },
        { start: '14:00', end: '14:30' },
        { start: '19:00', end: '19:30' },
      ],
    };

    const now = getCurrentTimeCST();
    const timeWindows = zoneTimeWindows[zoneId];

    if (timeWindows) {
      const isInAnyWindow = timeWindows.some(({ start, end }) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startTime = new Date(now);
        startTime.setHours(startH, startM, 0, 0);

        const endTime = new Date(now);
        endTime.setHours(endH, endM, 0, 0);

        return now >= startTime && now <= endTime;
      });

      if (!isInAnyWindow) {
        const timesStr = timeWindows
          .map(({ start, end }) => `${start} to ${end}`)
          .join(', ');
        throw new Error(`That zone is only available during these times (CST): ${timesStr}.`);
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