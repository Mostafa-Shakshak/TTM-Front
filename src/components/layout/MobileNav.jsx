import { Bell, Compass, Home, MessageCircleMore, Plus, UserRound } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSocket } from '../../context/SocketContext'

export default function MobileNav({ onCreate }) {
  const { unreadCount, messageUnreadCount } = useSocket()
  const location = useLocation()
  const formatMessagesBadge = (count) => (count > 99 ? '99+' : count)
  const isDiscoverActive = location.pathname === '/' && location.search.includes('view=discover')

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink to="/" end aria-label="Home" className={({ isActive }) => isActive && !isDiscoverActive ? 'active' : ''}>
        <Home size={22} />
      </NavLink>
      <NavLink to="/?view=discover" aria-label="Discover" className={() => (isDiscoverActive ? 'active' : '')}>
        <Compass size={22} />
      </NavLink>
      <button className="mobile-nav__create" onClick={onCreate} aria-label="Create post">
        <Plus size={23} />
      </button>
      <NavLink to="/notifications" aria-label="Activity">
        <Bell size={22} />
        {unreadCount > 0 && <i className="mobile-nav__badge">{unreadCount > 9 ? '9+' : unreadCount}</i>}
      </NavLink>
      <NavLink to="/messages" aria-label="Messages">
        <MessageCircleMore size={22} />
        {messageUnreadCount > 0 && <i className="mobile-nav__badge">{formatMessagesBadge(messageUnreadCount)}</i>}
      </NavLink>
      <NavLink to="/profile" aria-label="Profile">
        <UserRound size={22} />
      </NavLink>
    </nav>
  )
}
