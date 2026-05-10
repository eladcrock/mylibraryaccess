export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-paper/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Library Card Finder · Civic-tech for readers.</p>
        <p>Starting with California · Expanding nationwide</p>
      </div>
    </footer>
  );
}