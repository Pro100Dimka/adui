import { Button, EmptyState } from "@ad-voice/ui";

export default function EmptyStateExample() {
  return (
    <EmptyState
      icon="music"
      title="Пока нет записей"
      description="Спойте первую песню — запись появится здесь."
      action={
        <Button variant="primary" icon="plus">
          Новое выступление
        </Button>
      }
    />
  );
}
