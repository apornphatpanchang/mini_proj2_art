
import { Outlet, Link, useLocation } from 'react-router';
import { BookMarked, Home, Images, Info } from 'lucide-react';
import { useCollectionStore } from '../store/useCollectionStore';

export default function RootLayout() {
  const savedIds = useCollectionStore((state) => state.savedIds);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-neutral-800 font-sans pb-12">
      {/* Header */}
      <header className="pt-4 w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="bg-neutral-200/70 backdrop-blur-md rounded-full px-6 py-2.5 flex items-center justify-between">

          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              to="/"
              className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              The Art
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 text-xs font-medium">
            <Link
              to="/"
              className={`transition-colors hover:text-black ${
                location.pathname === '/'
                  ? 'text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              Home
            </Link>

            <Link
              to="/collection"
              className={`transition-colors flex items-center gap-1.5 hover:text-black ${
                location.pathname.startsWith('/collection')
                  ? 'text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              <BookMarked className="w-4 h-4 fill-black text-black" />

              <span>My Collection</span>

              {savedIds.length > 0 && (
                <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {savedIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/exhibition"
              className={`transition-colors hover:text-black ${
                location.pathname.startsWith('/exhibition')
                  ? 'text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              Exhibition
            </Link>

            <Link
              to="/about"
              className={`transition-colors hover:text-black ${
                location.pathname.startsWith('/about')
                  ? 'text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              to="/"
              className={`p-1.5 rounded-full ${
                location.pathname === '/'
                  ? 'text-black bg-neutral-300/60'
                  : 'text-neutral-600'
              }`}
              title="Home"
            >
              <Home className="w-4 h-4" />
            </Link>

            <Link
              to="/collection"
              className={`relative p-1.5 rounded-full ${
                location.pathname.startsWith('/collection')
                  ? 'text-black bg-neutral-300/60'
                  : 'text-neutral-600'
              }`}
              title="My Collection"
            >
              <BookMarked className="w-4 h-4 fill-black text-black" />

              {savedIds.length > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {savedIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/exhibition"
              className={`p-1.5 rounded-full ${
                location.pathname.startsWith('/exhibition')
                  ? 'text-black bg-neutral-300/60'
                  : 'text-neutral-600'
              }`}
              title="Exhibition"
            >
              <Images className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className={`p-1.5 rounded-full ${
                location.pathname.startsWith('/about')
                  ? 'text-black bg-neutral-300/60'
                  : 'text-neutral-600'
              }`}
              title="About"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-6">
        <Outlet />
      </main>
    </div>
  );
}
