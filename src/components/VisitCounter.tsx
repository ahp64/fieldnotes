interface VisitCounterProps {
  count: number
}

export function VisitCounter({ count }: VisitCounterProps) {
  return (
    <div className="bg-slate-950/70 backdrop-blur-md rounded-xl px-6 py-4 shadow-lg">
      <p className="text-sm text-slate-500 font-medium">{count} places visited</p>
    </div>
  )
}