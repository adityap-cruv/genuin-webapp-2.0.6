/**
 * Parses a nested color object and returns a flat object with CSS variable names as keys and color codes as values.
 *
 * The input `colors` object should have the following structure:
 *
 * {
 *   [category: string]: {
 *     [shade: string]: string;
 *   }
 * }
 *
 * For each color, the function generates a CSS variable name in the format:
 *   --gencl-color-{category}-{shade}
 * If the shade does not contain an underscore, the variable is:
 *   --gencl-color-{category}
 *
 * @param colors - An object containing color categories and their shades.
 * @returns An object mapping CSS variable names to color codes.
 */
export function parseBrandColors(colors: any) {
  const parsedColors: any = {};
  for (const category in colors) {
    const categoryColors = colors[category];
    for (const shade in categoryColors) {
      const colorCode = categoryColors[shade];
      const parsedShade = shade.split("_")[1];
      if (parsedShade) {
        parsedColors[`--gencl-color-${category}-${parsedShade}`] = colorCode;
      } else {
        parsedColors[`--gencl-color-${category}`] = colorCode;
      }
    }
  }
  return parsedColors;
}
