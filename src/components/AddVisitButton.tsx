import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'

export function AddVisitButton() {
  return (
    <Link
      href="/visits/new"
      className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group border-2 border-slate-700/30 hover:border-slate-600/40"
    >
      <div className="relative">
        <MapPin className="w-6 h-6 text-white drop-shadow-lg" />
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
          <Plus className="w-3 h-3 text-white font-bold" />
        </div>
      </div>
    </Link>
  )
}