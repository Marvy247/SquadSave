import Link from 'next/link';
import { Wallet, Moon, Sun, Home, Target, Plus, ChevronDown, Copy, LogOut, Menu } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';
import toast from 'react-hot-toast';
import { useWallet } from '@/lib/wallet-context';
import { useTheme } from '@/lib/theme-context';

export default function Header() {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const { isDark, toggleDark } = useTheme();

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard!');
    }
  };

  return (
    <header className="bg-background border-b border-border px-3 md:px-4 py-2 md:py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-1 md:space-x-2 hover:opacity-80 transition-opacity">
            <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h1 className="text-lg md:text-xl font-bold">SquadSave</h1>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <Link href="/dashboard" className="group flex items-center space-x-1 text-xs lg:text-sm hover:text-primary transition-all duration-200 hover:scale-105">
            <Home className="h-3 w-3 lg:h-4 lg:w-4 group-hover:rotate-12 transition-transform" />
            <span>Dashboard</span>
          </Link>
          <Link href="/missions" className="group flex items-center space-x-1 text-xs lg:text-sm hover:text-primary transition-all duration-200 hover:scale-105">
            <Target className="h-3 w-3 lg:h-4 lg:w-4 group-hover:animate-pulse" />
            <span>Missions</span>
          </Link>
          <Link href="/missions/create" className="group flex items-center space-x-1 text-xs lg:text-sm hover:text-primary transition-all duration-200 hover:scale-105">
            <Plus className="h-3 w-3 lg:h-4 lg:w-4 group-hover:rotate-90 transition-transform" />
            <span>Create</span>
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="sm" onClick={toggleDark} className="h-8 w-8 p-0 cursor-pointer">
            {isDark ? <Sun className="h-3 w-3 md:h-4 md:w-4" /> : <Moon className="h-3 w-3 md:h-4 md:w-4" />}
          </Button>
          {!account ? (
            <Button onClick={connectWallet} size="sm" className="text-xs md:text-sm px-2 md:px-3 cursor-pointer">
              <Wallet className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 cursor-pointer">
                  <Wallet className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  <span className="text-xs md:text-sm hidden sm:inline">
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </span>
                  <span className="text-xs sm:hidden">
                    {account.substring(0, 4)}...{account.substring(account.length - 2)}
                  </span>
                  <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 md:w-56">
                <DropdownMenuItem onClick={copyAddress} className="text-sm">
                  <Copy className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnectWallet} className="text-sm">
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-2 mt-6">
                  <Link href="/" className="group flex items-center space-x-3 text-base hover:text-primary transition-all duration-200 hover:translate-x-2 py-3 px-2 rounded-lg hover:bg-primary/5">
                    <Home className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    <span>Home</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">🏠</span>
                  </Link>
                  <Link href="/missions" className="group flex items-center space-x-3 text-base hover:text-primary transition-all duration-200 hover:translate-x-2 py-3 px-2 rounded-lg hover:bg-primary/5">
                    <Target className="h-4 w-4 group-hover:animate-pulse" />
                    <span>Missions</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">🎯</span>
                  </Link>
                  <Link href="/missions/create" className="group flex items-center space-x-3 text-base hover:text-primary transition-all duration-200 hover:translate-x-2 py-3 px-2 rounded-lg hover:bg-primary/5">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    <span>Create Mission</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">🚀</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
