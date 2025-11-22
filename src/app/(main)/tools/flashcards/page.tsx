'use client';

export default function FlashcardsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Flashcards</h1>
        <p className="text-muted-foreground">
          Create, import, and practice with flashcard sets.
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
                Flashcards Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
                This feature is currently under construction.
            </p>
        </div>
      </div>
    </div>
  );
}
