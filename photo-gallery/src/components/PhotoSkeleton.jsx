export default function PhotoSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="aspect-[16/10] w-full rounded-xl bg-[var(--color-border)] sm:aspect-[4/3] sm:w-56 sm:shrink-0 md:w-72" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-4 w-28 rounded bg-[var(--color-border)]" />
          <div className="h-5 w-40 rounded bg-[var(--color-border)]" />
          <div className="mt-2 h-9 w-24 rounded-full bg-[var(--color-border)]" />
        </div>
      </div>
    </div>
  )
}
