import { ScaffoldNote, ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ChatScreen() {
  return (
    <ScreenPlaceholder title="Group chat" subtitle="Discussing No Two Persons · 11 members">
      <ScaffoldNote
        label="CHAT"
        text="The message list, emoji reactions and the pinned composer arrive in a later milestone."
      />
    </ScreenPlaceholder>
  );
}
