'use client'

import { useEffect, useState } from 'react'
import { LayoutDashboard, Settings, Ticket, PanelLeft, PanelRight } from 'lucide-react'

import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import NavLink from './NavLink';

export default function Sidebar() {

    const pathname = usePathname();
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
      const stored = localStorage.getItem('sidebarExpanded');
      if (stored !== null) {
        setExpanded(stored === 'true');
      } else {
        const prefersExpanded = window.innerWidth >= 1024;
        setExpanded(prefersExpanded);
      }
    }, []);

    useEffect(() => {
      localStorage.setItem('sidebarExpanded', String(expanded));
    }, [expanded]);

  return (
    <div
      className={cn(
        'h-screen flex flex-col duration-300 p-2 shadow-md border-r',
        expanded ? 'w-64' : 'w-16'
      )}
    >
      {/* <div className="bg-slate-100"> */}
        <div className='flex justify-between items-center h-16 bg-zinc-50 border-b border-b-zinc-200 px-2'>
            <div className="flex items-center gap-2">
              <p className='bg-[#0074de] text-white text-[10px] rounded-full p-1 px-2'>ITX</p>
              {expanded && <h1 className="text-[#0074de] font-semibold">Helpdesk</h1>}
            </div>
            <button
              aria-label="Toggle sidebar"
              className="rounded hover:bg-zinc-100 p-1"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <PanelLeft size={18} /> : <PanelRight size={18} />}
            </button>
        </div>
      {/* </div> */}
      <nav className={cn('flex-1')}>
          <div className="flex flex-col items-center space-y-1 mt-4">
            <NavLink href='/dashboard' label="Dashboard" isActive={pathname === '/dashboard'} isSidebarHovered={expanded} >
                <LayoutDashboard size={21} className=''   strokeWidth={2} color='gray'/>
            </NavLink>
            <NavLink href='/tickets' label="Tickets" isActive={pathname === '/tickets'} isSidebarHovered={expanded}>
                <Ticket size={20} strokeWidth={2} color='gray' />
            </NavLink>
            <NavLink href='/admin/settings' label="Settings" isActive={pathname === '/admin/settings'} isSidebarHovered={expanded}>
                <Settings size={20} strokeWidth={2} color='gray'/>
            </NavLink>
          </div>
      </nav>
      <div className=" bg-zinc-200 h-12 rounded-lg w-full flex items-center gap-3 transition-all duration-300 px-2">
        <p className='ml-1 bg-black text-white text-[10px] rounded-full p-1'>ITX</p>
        {expanded && <span className='transition-all duration-300'>Signed in</span>}
      </div>
    </div>
  )
}



