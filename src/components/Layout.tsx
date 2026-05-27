import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Shirt, BookOpen, Sparkles, LogOut } from 'lucide-react'

export default function Layout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col max-w-lg mx-auto">
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-lg font-semibold text-stone-800">👗 My Closet</span>
        <button
          onClick={signOut}
          className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-stone-200 flex">
        <NavLink
          to="/wardrobe"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-stone-800' : 'text-stone-400'
            }`
          }
        >
          <Shirt size={20} />
          Wardrobe
        </NavLink>
        <NavLink
          to="/outfits"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-stone-800' : 'text-stone-400'
            }`
          }
        >
          <BookOpen size={20} />
          Outfits
        </NavLink>
        <NavLink
          to="/suggest"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-stone-800' : 'text-stone-400'
            }`
          }
        >
          <Sparkles size={20} />
          Suggest
        </NavLink>
      </nav>
    </div>
  )
}
