import { useState, useEffect, useRef } from "react";

interface IntersectionObserverOptions extends IntersectionObserverInit {
  // No custom options needed for now, but can be extended
}

// Example Usage (can be removed or kept for documentation):
/*
import React, { useRef, useEffect } from 'react';

const MyComponent = () => {
  const myRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(myRef, { threshold: 0.5 });

  useEffect(() => {
    if (isInView) {
      console.log('Element is in view!');
    } else {
      console.log('Element is out of view.');
    }
  }, [isInView]);

  return (
    <div ref={myRef} style={{ height: '100px', border: '1px solid black' }}>
      {isInView ? 'I am in view!' : 'Scroll me into view!'}
    </div>
  );
};

export default MyComponent;
*/
export function useInView<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options?: IntersectionObserverOptions
): boolean {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      // If the node is not yet available, or has been removed, ensure isInView is false
      // and clean up any existing observer.
      setIsInView(false);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Disconnect previous observer if options or node change
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsInView(entry.isIntersecting);
      }
    }, options);

    observerRef.current.observe(node);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [ref, options]); // Rerun effect if ref object itself or options change

  return isInView;
}
