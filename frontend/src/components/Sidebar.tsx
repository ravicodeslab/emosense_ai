"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, BarChart2, Lightbulb, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/detect', label: 'Live Detect', icon: Camera },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/suggestions', label: 'Wellbeing', icon: Lightbulb },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen glass border-r border-slate-200 dark:border-slate-800 flex flex-col pt-8 pb-4">
      <div className="px-6 mb-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 shadow-md shadow-violet-500/50 flex items-center justify-center">
          <Camera size={16} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-slate-400">Emosense</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-violet-500/10 text-violet-500 font-medium' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
              <Icon size={18} className={active ? 'text-violet-500' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <User size={18} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800 dark:text-slate-200">Demo User</p>
            <p className="text-slate-400 text-xs">Free Mode</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
