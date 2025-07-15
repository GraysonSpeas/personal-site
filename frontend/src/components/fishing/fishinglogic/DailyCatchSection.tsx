import { DailyCatchUI } from '../fishingui/DailyCatchUI';
import type { CatchFish } from '../fishinglogic/TimeContentProvider';

export function DailyCatchSection({ catchOfTheDay }: { catchOfTheDay: CatchFish[] }) {
  return (
    <section className="mb-4">
      <DailyCatchUI catchOfTheDay={catchOfTheDay} />
    </section>
  );
}