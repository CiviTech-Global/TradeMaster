import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../application/redux/hooks';
import { signout, selectUser } from '../../../application/redux';
import { ThemeToggle } from '../TradeMaster';
import './Sidebar.css';

interface SidebarItem {
  id: string;
  translationKey: string;
  path: string;
  icon: React.ReactNode;
  type: 'navigation' | 'action';
}

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/></svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const LogoutIcon = () => (
  <svg className="icon-flip-rtl" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

const Sidebar: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'sidebar' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { id: 'home', translationKey: 'home', path: '/dashboard/home', icon: <HomeIcon />, type: 'navigation' },
    { id: 'my-businesses', translationKey: 'myBusinesses', path: '/dashboard/my-businesses', icon: <BuildingIcon />, type: 'navigation' },
    { id: 'profile', translationKey: 'profile', path: '/dashboard/profile', icon: <UserIcon />, type: 'navigation' },
    { id: 'settings', translationKey: 'settings', path: '/dashboard/settings', icon: <SettingsIcon />, type: 'navigation' },
    { id: 'logout', translationKey: 'logout', path: '/signin', icon: <LogoutIcon />, type: 'action' },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.type === 'action' && item.id === 'logout') {
      dispatch(signout());
      navigate('/signin');
    } else {
      navigate(item.path);
    }
    setMobileOpen(false);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path ||
           (path === '/dashboard/home' && location.pathname === '/dashboard');
  };

  return (
    <>
      <button
        className="sidebar__mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={commonT('toggleMenu')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">🏪</span>
            <span className="sidebar__brand-text">{commonT('appName')}</span>
          </div>
          {user && (
            <div className="sidebar__user">
              <div className="sidebar__user-avatar">
                {user.firstname?.[0]}{user.lastname?.[0]}
              </div>
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">
                  {user.firstname} {user.lastname}
                </span>
                <span className="sidebar__user-email">{user.email}</span>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {sidebarItems.map((item) => (
              <li key={item.id} className="sidebar__nav-item">
                <button
                  className={`sidebar__nav-link ${
                    isActive(item.path) ? 'sidebar__nav-link--active' : ''
                  } ${item.type === 'action' ? 'sidebar__nav-link--action' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="sidebar__nav-icon">{item.icon}</span>
                  <span className="sidebar__nav-text">{t(item.translationKey)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <ThemeToggle />
        </div>
      </aside>

      {mobileOpen && (
        <div className="sidebar__overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
