import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Ensei
        </div>
        <div className="space-x-4">
          <Link href="/missions" className="text-gray-300 hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/missions/create" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
            Create Mission
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent">
            Ensei Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
            The future of social media engagement. Create missions, earn rewards, build communities.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Create Missions</h3>
              <p className="text-gray-400 text-sm">Launch engagement campaigns across all major platforms</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-400 text-sm">Complete tasks and earn Honors that convert to real value</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="text-lg font-semibold mb-2">Multi-Platform</h3>
              <p className="text-gray-400 text-sm">Twitter, Instagram, TikTok, Telegram, and more</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/missions"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔍 Discover Missions
            </Link>
            <Link
              href="/missions/create"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚀 Create Mission
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 border-t border-gray-800">
        <p>&copy; 2024 Ensei Platform. The future of social engagement.</p>
      </footer>
    </div>
  );
}
