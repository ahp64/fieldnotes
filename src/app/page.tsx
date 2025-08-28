import MapGlobe from '@/components/MapGlobe'

export default function Home() {
  return (
    <div className="h-screen w-full relative">
      {/* Globe Container */}
      <div className="absolute inset-0">
        <MapGlobe />
      </div>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Your Travel Globe</h2>
            <p className="text-sm text-slate-300">5 places visited</p>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-slate-300">Your visits</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-slate-300">Wishlist</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
          <div className="flex items-center space-x-4 text-sm text-slate-300">
            <button className="hover:text-white transition-colors">🌍 Globe View</button>
            <div className="w-px h-4 bg-slate-600"></div>
            <button className="hover:text-white transition-colors">📍 Add Visit</button>
            <div className="w-px h-4 bg-slate-600"></div>
            <button className="hover:text-white transition-colors">🔍 Search</button>
          </div>
        </div>
      </div>
    </div>
  )
}