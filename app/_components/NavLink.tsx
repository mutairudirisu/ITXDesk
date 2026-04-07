import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";



type NavLinkProps = {
    children: React.ReactNode;
    isActive?: boolean;
    href: string;
    label: string;
    isSidebarHovered: boolean;
  }


export default function NavLink ({ children, label, href, isSidebarHovered, isActive = false } : NavLinkProps) {

    return (
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                <Link 
                    href={href}
                    className={`
                    flex items-center font-normal rounded-md 
                    hover:bg-zinc-100 hover:text-zinc-900 transition-all dark:hover:bg-zinc-900/60
                     h-11 w-full
                     ${isActive ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/60 dark:text-zinc-50"
                        : "hover:bg-zinc-100 hover:text-zinc-900" }`}
                    
                >
                <span className='ml-3.5'>
                {children}
                </span>
                <span className={cn("ml-2 text-sm font-medium transition-all duration-300", {'hidden': !isSidebarHovered,
                'inline-block': isSidebarHovered})}>{label}</span>
                </Link>
                </TooltipTrigger>
                {!isSidebarHovered && <TooltipContent 
                side="right" 
                align="center" 
                sideOffset={13}
                className="bg-zinc-900 text-white border border-zinc-800 px-2 py-1 text-sm"
                >
                <div className="">
                    <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                    {label}
                </div>
                </TooltipContent>}
            </Tooltip>
            </TooltipProvider>
    )
}
