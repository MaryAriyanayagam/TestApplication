import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, BookOpen, ShoppingCart, Package } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/planner', icon: Calendar, label: 'Planner' },
  { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  { to: '/pantry', icon: Package, label: 'Pantry' },
  { to: '/shopping', icon: ShoppingCart, label: 'Shopping' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon size={22} className="mb-0.5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
