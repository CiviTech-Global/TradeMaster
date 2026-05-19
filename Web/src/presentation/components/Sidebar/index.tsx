import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../application/redux/hooks';
import { signout, selectUser } from '../../../application/redux';
import './Sidebar.css';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  type: 'navigation' | 'action';
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/dashboard/home',
    icon: '🏠',
    type: 'navigation'
  },
  {
    id: 'my-businesses',
    label: 'My Businesses',
    path: '/dashboard/my-businesses',
    icon: '🏢',
    type: 'navigation'
  },
  {
    id: 'products',
    label: 'Products',
    path: '/dashboard/my-businesses',
    icon: '📦',
    type: 'navigation'
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/dashboard/orders',
    icon: '📋',
    type: 'navigation'
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/dashboard/messages',
    icon: '💬',
    type: 'navigation'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    path: '/dashboard/reviews',
    icon: '\u2B50',
    type: 'navigation'
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/dashboard/profile',
    icon: '👤',
    type: 'navigation'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    icon: '⚙️',
    type: 'navigation'
  },
  {
    id: 'logout',
    label: 'Logout',
    path: '/signin',
    icon: '🚪',
    type: 'action'
  }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleItemClick = (item: SidebarItem) => {
    if (item.type === 'action' && item.id === 'logout') {
      dispatch(signout());
      navigate('/signin');
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string, id?: string): boolean => {
    if (id === 'products') {
      return location.pathname.startsWith('/dashboard/products/');
    }
    return location.pathname === path ||
           (path === '/dashboard/home' && location.pathname === '/dashboard');
  };

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <h2 className="sidebar__brand">TradeMaster</h2>
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
                  isActive(item.path, item.id) ? 'sidebar__nav-link--active' : ''
                } ${item.type === 'action' ? 'sidebar__nav-link--action' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-text">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;