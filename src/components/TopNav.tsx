import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'בית', to: '/' },
  { label: 'סטודיו חזיתות 3D', to: '/studio' },
  { label: 'גלגל הצבעים', to: '/wheel' },
  { label: 'פסיכולוגיית הצבעים', to: '/color-psychology' },
  { label: 'איך צבעים עובדים', to: '/how-colors-work' },
];

const TopNav = () => (
  <nav dir="rtl" className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-4 py-2.5 border-b border-white/[0.06]"
    style={{ background: 'linear-gradient(180deg, rgba(11,13,17,0.92) 0%, rgba(11,13,17,0.78) 100%)', backdropFilter: 'blur(14px)' }}>
    <NavLink to="/" className="hidden md:flex items-center gap-2 shrink-0">
      <span className="ag-logo" aria-hidden />
      <span className="ag-display font-bold text-lg tracking-tight text-newton-text">Archi‑Genome</span>
    </NavLink>
    <div className="flex-1 flex md:justify-center gap-1.5 overflow-x-auto no-scrollbar">
      {navItems.map(({ label, to }) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({ isActive }) => cn(
            'relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200',
            isActive ? 'text-[#0d1320]' : 'text-[hsl(218,33%,90%)] hover:text-white hover:bg-white/5',
          )}>
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-to-b from-[#a7c5ff] to-[#77a5ff] shadow-[0_2px_14px_rgba(119,165,255,0.35)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default TopNav;
