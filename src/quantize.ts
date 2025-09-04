/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-shadow */
import { compareNumbers } from './compare-numbers.ts';
import { PriorityQueue } from './priority-queue.ts';

//
// quantize.js Copyright 2008 Nick Rabinowitz
// Ported to node.js by Olivier Lesnicki
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
//
// Basic Javascript port of the MMCQ (modified median cut quantization)
// algorithm from the Leptonica library (http://www.leptonica.com/).
// Returns a color map you can use to map original pixels to the reduced
// palette. Still a work in progress.
//
// array of pixels as [R,G,B] arrays
// var myPixels = [[190,197,190], [202,204,200], [207,214,210], [211,214,211], [205,207,207]
// etc
// ];
// var maxColors = 4;
//
// var cMap = MMCQ.quantize(myPixels, maxColors);
// var newPalette = cMap.palette();
// var newPixels = myPixels.map(function(p) {
//    return cMap.map(p);
// });
//

// private constants
const SIGNIFICANT_BITS = 5;
const SHIFT = 8 - SIGNIFICANT_BITS;
const MAX_ITERATIONS = 1000;
const FRACTION_POPULATIONS = 0.75;

//#region RGB
/**
 * Represents an RGB color.
 * @group Array
 * @category Operations
 */
export type RGB = {
  /** r - The red component (0-255). */
  r: number;
  /** g - The green component (0-255). */
  g: number;
  /** b - The blue component (0-255). */
  b: number;
};
//#endregion
//#region VBox
class VBox {
  public constructor(
    public min: RGB,
    public max: RGB,
    public histogram: Histogram,
  ) {}

  private cachedVolume: null | number = null;
  private cachedCount: null | number = null;
  private cachedColorCount: null | number = null;
  private cachedAvg: null | RGB = null;

  public copy(): VBox {
    return new VBox({ ...this.min }, { ...this.max }, this.histogram);
  }

  public volume(): number {
    this.cachedVolume ??=
      (this.max.r - this.min.r + 1) * (this.max.g - this.min.g + 1) * (this.max.b - this.min.b + 1);
    return this.cachedVolume;
  }

  public pixelCount(): number {
    if (this.cachedCount === null) {
      let nPixels = 0;
      for (let { r } = this.min; r <= this.max.r; r++) {
        for (let { g } = this.min; g <= this.max.g; g++) {
          for (let { b } = this.min; b <= this.max.b; b++) {
            nPixels += this.histogram.get(r, g, b);
          }
        }
      }
      this.cachedCount = nPixels;
    }
    return this.cachedCount;
  }

  public colorCount(): number {
    if (this.cachedColorCount === null) {
      let nColors = 0;
      for (let { r } = this.min; r <= this.max.r; r++) {
        for (let { g } = this.min; g <= this.max.g; g++) {
          for (let { b } = this.min; b <= this.max.b; b++) {
            nColors += this.histogram.get(r, g, b) === 0 ? 0 : 1;
          }
        }
      }
      this.cachedColorCount = nColors;
    }
    return this.cachedColorCount;
  }

  public averageColor(): RGB {
    if (this.cachedAvg === null) {
      const multiplier = 1 << SHIFT;
      let sum = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;

      for (let { r } = this.min; r <= this.max.r; r++) {
        for (let { g } = this.min; g <= this.max.g; g++) {
          for (let { b } = this.min; b <= this.max.b; b++) {
            const hVal = this.histogram.get(r, g, b);
            sum += hVal;
            sumR += hVal * (r + 0.5) * multiplier;
            sumG += hVal * (g + 0.5) * multiplier;
            sumB += hVal * (b + 0.5) * multiplier;
          }
        }
      }

      this.cachedAvg =
        sum ?
          { r: Math.trunc(sumR / sum), g: Math.trunc(sumG / sum), b: Math.trunc(sumB / sum) }
        : {
            r: Math.trunc((multiplier * (this.min.r + this.max.r + 1)) / 2),
            g: Math.trunc((multiplier * (this.min.g + this.max.g + 1)) / 2),
            b: Math.trunc((multiplier * (this.min.b + this.max.b + 1)) / 2),
          };
    }
    return this.cachedAvg;
  }

  public contains(pixel: RGB): boolean {
    const r = pixel.r >> SHIFT;
    const g = pixel.g >> SHIFT;
    const b = pixel.b >> SHIFT;

    return (
      r >= this.min.r &&
      r <= this.max.r &&
      g >= this.min.g &&
      g <= this.max.g &&
      b >= this.min.b &&
      b <= this.max.b
    );
  }

  public static fromPixels(pixels: RGB[], histogram: Histogram): VBox {
    let rMin = 255 >> SHIFT;
    let rMax = 0;
    let gMin = 255 >> SHIFT;
    let gMax = 0;
    let bMin = 255 >> SHIFT;
    let bMax = 0;

    for (const pixel of pixels) {
      const r = pixel.r >> SHIFT;
      const g = pixel.g >> SHIFT;
      const b = pixel.b >> SHIFT;

      if (r < rMin) {
        rMin = r;
      }
      if (r > rMax) {
        rMax = r;
      }

      if (g < gMin) {
        gMin = g;
      }
      if (g > gMax) {
        gMax = g;
      }

      if (b < bMin) {
        bMin = b;
      }
      if (b > bMax) {
        bMax = b;
      }
    }

    return new VBox({ r: rMin, g: gMin, b: bMin }, { r: rMax, g: gMax, b: bMax }, histogram);
  }
}
//#endregion
//#region ColorMap
type ColorData = {
  vbox: VBox;
  color: RGB;
};

class ColorMap {
  public constructor(queue: PriorityQueue<VBox>) {
    this.data = new PriorityQueue<ColorData>(
      (a, b) => compareNumbers(b.vbox.pixelCount(), a.vbox.pixelCount()),
      queue.map((q) => ({ vbox: q, color: q.averageColor() })),
    );
  }

  private readonly data: PriorityQueue<ColorData>;

  public palette(): RGB[] {
    return this.data.map((vb) => vb.color);
  }

  public get size(): number {
    return this.data.size;
  }

  public map(color: RGB): RGB | null {
    for (const datum of this.data) {
      if (datum.vbox.contains(color)) {
        return datum.color;
      }
    }
    return this.nearest(color);
  }

  public nearest(color: RGB): RGB | null {
    let diff = Infinity;
    let pColor: RGB | null = null;

    for (const datum of this.data) {
      const d = Math.hypot(
        datum.color.r - color.r,
        datum.color.g - color.g,
        datum.color.b - color.b,
      );

      if (d < diff) {
        diff = d;
        pColor = datum.color;
      }
    }
    return pColor;
  }
}
//#endregion
//#region Histogram
class Histogram {
  public constructor(pixels: RGB[]) {
    this.histogram = Array.from<number>({ length: 1 << (3 * SIGNIFICANT_BITS) }).fill(0);

    for (const pixel of pixels) {
      this.histogram[
        Histogram.getColorIndex(pixel.r >> SHIFT, pixel.g >> SHIFT, pixel.b >> SHIFT)
      ] += 1;
    }
  }

  private readonly histogram: number[];

  public get(r: number, g: number, b: number): number {
    return this.histogram[Histogram.getColorIndex(r, g, b)] || 0;
  }

  public colors(): number {
    return this.histogram.reduce((a, v) => a + (v > 0 ? 1 : 0), 0);
  }

  private static getColorIndex(r: number, g: number, b: number): number {
    return (r << (2 * SIGNIFICANT_BITS)) + (g << SIGNIFICANT_BITS) + b;
  }
}
//#endregion
//#region medianCut
function medianCut(histogram: Histogram, vbox: VBox): [VBox | null, VBox | null] {
  const ΔR = vbox.max.r - vbox.min.r + 1;
  const ΔG = vbox.max.g - vbox.min.g + 1;
  const ΔB = vbox.max.b - vbox.min.b + 1;
  const maxW = Math.max(ΔR, ΔG, ΔB);

  /* Find the partial sum arrays along the selected axis. */
  let total = 0;
  let color: 'r' | 'g' | 'b';
  const partialSum: number[] = [];

  if (maxW === ΔR) {
    for (let { r } = vbox.min; r <= vbox.max.r; r++) {
      for (let { g } = vbox.min; g <= vbox.max.g; g++) {
        for (let { b } = vbox.min; b <= vbox.max.b; b++) {
          total += histogram.get(r, g, b);
        }
      }
      partialSum[r] = total;
    }
    color = 'r';
  } else if (maxW === ΔG) {
    for (let { g } = vbox.min; g <= vbox.max.g; g++) {
      for (let { r } = vbox.min; r <= vbox.max.r; r++) {
        for (let { b } = vbox.min; b <= vbox.max.b; b++) {
          total += histogram.get(r, g, b);
        }
      }
      partialSum[g] = total;
    }
    color = 'g';
  } else {
    /* maxW == bw */
    for (let { b } = vbox.min; b <= vbox.max.b; b++) {
      for (let { r } = vbox.min; r <= vbox.max.r; r++) {
        for (let { g } = vbox.min; g <= vbox.max.g; g++) {
          total += histogram.get(r, g, b);
        }
      }
      partialSum[b] = total;
    }
    color = 'b';
  }

  let vbox1: VBox | null = vbox.copy();
  let vbox2: VBox | null = vbox.copy();

  for (let i = vbox.min[color]; i <= vbox.max[color]; i++) {
    if (partialSum[i] > total / 2) {
      const left = i - vbox.min[color];
      const right = vbox.max[color] - i;

      const d2 =
        left <= right ?
          Math.min(vbox.max[color] - 1, Math.trunc((i + vbox.max[color]) / 2))
        : Math.max(vbox.min[color], Math.trunc((vbox.min[color] + i) / 2));

      // set dimensions
      vbox1.max[color] = d2;
      vbox2.min[color] = d2 + 1;

      if (vbox2.colorCount() === 0) {
        vbox2 = null;
      }

      if (vbox1.colorCount() === 0) {
        vbox1 = vbox2;
        vbox2 = null;
      }

      break;
    }
  }

  return [vbox1, vbox2];
}
//#endregion
//#region quantize
/**
 * Quantizes an array of RGB pixels into a reduced color palette with a maximum number of colors.
 * Utilizes a median cut algorithm to partition the color space and generate a color map.
 * Returns `undefined` if the input is invalid or the constraints are not met.
 *
 * @param pixels - An array of RGB pixel values to be quantized.
 * @param maxColors - The maximum number of colors allowed in the resulting palette (must be between 2 and 256).
 * @returns A `ColorMap` representing the quantized palette, or `undefined` if quantization is not possible.
 *
 * @example
 * ```typescript
 * const pixels: RGB[] = [
 *   { r: 255, g: 0, b: 0 },
 *   { r: 0, g: 255, b: 0 },
 *   { r: 0, g: 0, b: 255 },
 *   // ... more pixels
 * ];
 * const palette = quantize(pixels, 16);
 * if (palette) {
 *   // Use the palette for image processing
 * }
 * ```
 * @group Array
 * @category Operations
 */
export function quantize(pixels: RGB[], maxColors: number): ColorMap | undefined {
  if (pixels.length === 0 || maxColors < 2 || maxColors > 256) {
    return undefined;
  }

  // TODO [>2.1]: check color content and convert to grayscale if insufficient

  const histogram = new Histogram(pixels);

  // check that we aren't below maxColors already
  const nColors = histogram.colors();
  if (nColors <= maxColors) {
    // TODO [>2.1]: generate the new colors from the histogram  and return
  }

  // get the beginning vbox from the colors
  const vbox = VBox.fromPixels(pixels, histogram);
  const pq = new PriorityQueue<VBox>((a, b) => compareNumbers(b.colorCount(), a.colorCount()));
  pq.push(vbox);

  // inner function to do the iteration
  function split(target: number): void {
    let nColors = pq.size;
    let nIterations = 0;

    while (nIterations < MAX_ITERATIONS) {
      if (nIterations++ > MAX_ITERATIONS || nColors >= target) {
        break;
      }

      const vbox = pq.pop();
      if (vbox?.pixelCount()) {
        // do the cut
        const vBoxes = medianCut(histogram, vbox);
        const [vbox1, vbox2] = vBoxes;

        if (vbox1) {
          pq.push(vbox1);
          if (vbox2) {
            pq.push(vbox2);
            nColors++;
          }
        }
      }
    }
  }

  // first set of colors, sorted by population
  split(FRACTION_POPULATIONS * maxColors);

  // Re-sort by the product of pixel occupancy times the size in color space.
  pq.reorder((a, b) => compareNumbers(b.colorCount() * b.volume(), a.colorCount() * a.volume()));

  // next set - generate the median cuts using the (nPix * vol) sorting.
  split(maxColors);

  // calculate the actual colors
  return new ColorMap(pq);
}
//#endregion
