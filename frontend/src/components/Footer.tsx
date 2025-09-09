import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border px-3 md:px-4 py-4 md:py-6 mt-auto">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-1 md:space-x-2 mb-2">
          <Heart className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
          <span className="text-xs md:text-sm text-muted-foreground">
            Built with love for SquadSave
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2025 SquadSave. Save smart, have fun!
        </p>
      </div>
    </footer>
  );
}
