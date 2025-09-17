import { Navigation } from '@/components/Navigation'

export default function About() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Your travels, beautifully mapped
          </h1>
          <p className="text-xl text-slate-400 text-balance max-w-2xl mx-auto">
            Create a personalized travelogue with photos, notes, and ratings. 
            Follow friends and discover amazing places on an interactive globe.
          </p>
          <div className="pt-4">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              🌍 View Your Globe
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white">Track Visits</h3>
            <p className="text-slate-400">
              Add places you've been with photos, ratings, and personal notes
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white">Explore Globe</h3>
            <p className="text-slate-400">
              View all your travels on a beautiful 3D globe with smooth interactions
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-white">Social Features</h3>
            <p className="text-slate-400">
              Follow friends, discover new places, and share travel experiences
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}