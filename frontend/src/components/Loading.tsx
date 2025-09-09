import { Loader2, Wallet } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'wallet' | 'minimal';
  className?: string;
}

export default function Loading({
  message = "Loading...",
  size = 'md',
  variant = 'default',
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      </div>
    );
  }

  if (variant === 'wallet') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
        <div className="relative">
          <Wallet className={`${sizeClasses[size]} text-primary animate-pulse`} />
          <Loader2 className={`${sizeClasses.sm} animate-spin text-primary absolute -top-1 -right-1`} />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${containerClasses[size]} ${className}`}>
      <div className="relative">
        {/* Animated coin stack */}
        <div className="relative">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🪙</div>
          <div className="text-3xl animate-bounce absolute -top-2 -right-2" style={{ animationDelay: '200ms' }}>💰</div>
          <div className="text-2xl animate-bounce absolute -bottom-1 -left-2" style={{ animationDelay: '400ms' }}>💵</div>
        </div>
        {/* Pulsing background circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {message}
        </h3>
        <div className="flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Building your savings adventure... 🎯</p>
      </div>
    </div>
  );
}

// Specialized loading components for common use cases
export function PageLoading({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message={message} size="lg" />
    </div>
  );
}

export function CardLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="p-8">
      <Loading message={message} size="md" />
    </div>
  );
}

export function ButtonLoading({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

export function WalletLoading({ message = "Connecting wallet..." }: { message?: string }) {
  return <Loading message={message} size="md" variant="wallet" />;
}
