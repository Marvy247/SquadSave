import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiComponentProps {
  show: boolean;
  onComplete?: () => void;
}

export default function ConfettiComponent({ show, onComplete }: ConfettiComponentProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!show) return null;

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      onConfettiComplete={onComplete}
      colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']}
    />
  );
}
