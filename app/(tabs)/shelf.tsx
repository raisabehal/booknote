import { ScaffoldNote, ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ShelfScreen() {
  return (
    <ScreenPlaceholder title="The Shelf" subtitle="Everything Rhythm Readers has read & rated">
      <ScaffoldNote
        label="SHELF"
        text="Read stats, the genre breakdown and the rated past-reads list arrive in a later milestone."
      />
    </ScreenPlaceholder>
  );
}
