import { Button, EmptyState } from "@neo-ui-kit/react";

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
