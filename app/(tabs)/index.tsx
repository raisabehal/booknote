import { ScaffoldNote, ScreenPlaceholder } from '@/components/screen-placeholder';

export default function HomeScreen() {
  return (
    <ScreenPlaceholder title="Rhythm Readers" subtitle="11 members · Chapel Hill, NC">
      <ScaffoldNote
        label="HOME"
        text="Next meeting, club progress, coming-up list and the bookshelf land here in milestone 4."
      />
    </ScreenPlaceholder>
  );
}
