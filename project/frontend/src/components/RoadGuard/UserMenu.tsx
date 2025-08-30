import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState<string>('User');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('user');

  useEffect(() => {
    const deriveFromObject = (obj: any) => {
      const rawName: string | undefined = obj?.name || obj?.username || undefined;
      const emailStr: string = (obj?.email && typeof obj.email === 'string') ? String(obj.email) : '';
      const emailPrefix = emailStr ? emailStr.split('@')[0] : '';
      const best = (rawName && String(rawName).trim().length > 0) ? String(rawName).trim() : (emailPrefix || 'User');
      const tokenWord = best.split(/[\s_.-]+/)[0];
      const display = tokenWord.charAt(0).toUpperCase() + tokenWord.slice(1).toLowerCase();
      setName(display);
      setEmail(emailStr || '');
      setRole(obj?.role || 'user');
    };

    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        deriveFromObject(u);
        return;
      }
      // Fallback: try to decode JWT to extract name/email
      const token = localStorage.getItem('accessToken');
      if (token && token.split('.').length === 3) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          deriveFromObject({
            name: payload?.name,
            username: payload?.username,
            email: payload?.email,
            role: payload?.role
          });
          return;
        } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('mechanicRequests');
    localStorage.removeItem('currentRequest');
    localStorage.removeItem('currentRequestId');
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const firstName = name || 'User';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserIcon className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-gray-700">{firstName}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20" role="menu">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email || '—'}</p>
          </div>
          {role === 'user' && (
            <button
              onClick={() => { setOpen(false); navigate('/vehicles'); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
              role="menuitem"
            >
              <Car className="w-4 h-4" />
              My Vehicles
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            role="menuitem"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
