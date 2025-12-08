import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in');
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fade-out');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-opacity ${prefersReducedMotion ? '' : 'duration-300'} ${
        transitionStage === 'fade-out' && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'
      }`}
      onTransitionEnd={() => {
        if (transitionStage === 'fade-out') {
          setTransitionStage('fade-in');
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
}

// Slide transition (for modals/drawers)
export function SlideTransition({
  isOpen,
  children,
  direction = 'right',
  className = '',
}: {
  isOpen: boolean;
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  const transitions = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${transitions[direction]}
        ${isOpen ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}

// Scale transition (for popups)
export function ScaleTransition({
  isOpen,
  children,
  className = '',
}: {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`
        transition-all duration-200 ease-out
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        ${className}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}
