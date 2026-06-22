import { ScaffoldNote, ScreenPlaceholder } from '@/components/screen-placeholder';

export default function VoteScreen() {
  return (
    <ScreenPlaceholder title="Votes" subtitle="Each poll picks the book for one meeting.">
      <ScaffoldNote
        label="VOTE"
        text="Per-meeting polls with tap-to-vote bars and the draft → send flow arrive in milestone 6."
      />
    </ScreenPlaceholder>
  );
}
