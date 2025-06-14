export function getOpacity(index: number, totalVisibleItems: number) {
    const lastIndex = totalVisibleItems - 1;
    if (totalVisibleItems === 1) return 1;
    if (index === lastIndex) return 1;

    // Reduce opacity the further an item is from the top
    const stepsFromTop = lastIndex - index;
    const reducedOpacity = 1 - stepsFromTop * 0.3;
    return Math.max(reducedOpacity, 0.1);
  }
