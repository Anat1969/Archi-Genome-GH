import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'תורת הצבע', to: '/' },
  { label: 'פסיכולוגיית הצבעים', to: '/color-psychology' },
  { label: 'איך צבעים עובדים', to: '/how-colors-work' },
  { label: 'גלגל הצבעים', to: '/wheel' },
];

const TopNav = () => (
  <nav dir="rtl" className="fixed top-0 left-0 right-0 z-50 flex justify-center gap-3 px-4 py-3"
    style={{ background: 'linear-gradient(180deg, rgba(15,17,21,0.95) 0%, rgba(15,17,21,0.85) 100%)', backdropFilter: 'blur(12px)' }}>
    {navItems.map(({ label, to }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          cn(
            'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border',
            'hover:scale-[1.03]',
            isActive
              ? 'bg-gradient-to-b from-[#a7c5ff] to-[#77a5ff] text-[#0d1320] border-transparent shadow-[0_2px_12px_rgba(119,165,255,0.3)]'
              : 'bg-[hsl(220,22%,16%)] text-[hsl(218,33%,96%)] border-white/8 hover:border-white/15'
          )
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
);

export default TopNav;
