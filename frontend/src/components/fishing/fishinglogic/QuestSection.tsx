import { QuestUI } from '../fishingui/QuestUI';
import type { QuestType } from '../fishinglogic/TimeContentProvider';

export function QuestSection({ quests }: { quests: QuestType[] }) {
  return (
    <section className="mb-4">
      <QuestUI quests={quests} />
    </section>
  );
}