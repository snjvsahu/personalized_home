export function LoadingState() {
  return (
    <div className="loading" role="status">
      <p>Loading your personalized home.</p>
      <div className="skeleton" aria-hidden="true">
        <div className="skeleton-block tall" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
    </div>
  )
}
