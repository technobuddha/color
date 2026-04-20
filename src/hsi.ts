import {
  type Alpha,
  type CMY,
  type CMYK,
  type HCG,
  type HSL,
  type HSV,
  type HWB,
  type LAB,
  type LCH,
  type PartialColor,
  type RGB,
  type StringOptions,
  type XYZ,
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { rgb } from './rgb.ts';
import {
  approxEq,
  getAngle,
  getPercent,
  re,
  reAlpha,
  reAngle,
  reCp,
  reOp,
  rePercent,
  reSep,
  round,
} from './util.ts';

type OHSI = { h: number; s: number; i: number };
type IHSI = { hue: number; saturation: number; intensity: number };
type InternalHSI = Alpha & IHSI;
export type PartialHSI = Alpha & (IHSI | OHSI | (IHSI & OHSI));
export type HSI = Alpha & IHSI & OHSI;

export const hsi: ColorSpace<HSI, PartialHSI, InternalHSI> = {
  is(color: PartialColor): color is PartialHSI {
    return (
      ('h' in color && 's' in color && 'i' in color) ||
      ('hue' in color && 'saturation' in color && 'intensity' in color)
    );
  },

  internal(color: PartialHSI): InternalHSI {
    if ('hue' in color && 'saturation' in color && 'intensity' in color) {
      return {
        hue: color.hue,
        saturation: color.saturation,
        intensity: color.intensity,
        alpha: color.alpha,
      };
    }
    return {
      hue: color.h / 360,
      saturation: color.s / 100,
      intensity: color.i / 100,
      alpha: color.alpha,
    };
  },

  external({ hue, saturation, intensity, alpha }: InternalHSI): HSI {
    const obj = {
      h: round(hue * 360, 2),
      s: round(saturation * 100, 2),
      i: round(intensity * 100, 2),
      hue,
      saturation,
      intensity,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialHSI): RGB {
    const { hue, saturation, intensity, alpha } = hsi.internal(color);
    let red = intensity;
    let green = intensity;
    let blue = intensity;

    if (!approxEq(saturation, 0)) {
      const H = hue * 6;
      const Z = 1 - Math.abs((H % 2) - 1);
      const C = (3 * intensity * saturation) / (1 + Z);
      const X = C * Z;

      switch (Math.floor(H)) {
        case 0: {
          [red, green, blue] = [C, X, 0];
          break;
        }
        case 1: {
          [red, green, blue] = [X, C, 0];
          break;
        }
        case 2: {
          [red, green, blue] = [0, C, X];
          break;
        }
        case 3: {
          [red, green, blue] = [0, X, C];
          break;
        }
        case 4: {
          [red, green, blue] = [X, 0, C];
          break;
        }
        case 5: {
          [red, green, blue] = [C, 0, X];
          break;
        }

        // no default
      }

      const M = intensity * (1 - saturation);
      red += M;
      green += M;
      blue += M;
    }

    return rgb.external({ red, green, blue, alpha });
  },

  toHSL(color: PartialHSI): HSL {
    return rgb.toHSL(hsi.toRGB(color));
  },

  toHSV(color: PartialHSI): HSV {
    return rgb.toHSV(hsi.toRGB(color));
  },

  toHSI(color: PartialHSI): HSI {
    return hsi.external(hsi.internal(color));
  },

  toHWB(color: PartialHSI): HWB {
    return rgb.toHWB(hsi.toRGB(color));
  },

  toHCG(color: PartialHSI): HCG {
    return rgb.toHCG(hsi.toRGB(color));
  },

  toCMY(color: PartialHSI): CMY {
    return rgb.toCMY(hsi.toRGB(color));
  },

  toCMYK(color: PartialHSI): CMYK {
    return rgb.toCMYK(hsi.toRGB(color));
  },

  toXYZ(color: PartialHSI): XYZ {
    return rgb.toXYZ(hsi.toRGB(color));
  },

  toLAB(color: PartialHSI): LAB {
    return rgb.toLAB(hsi.toRGB(color));
  },

  toLCH(color: PartialHSI): LCH {
    return rgb.toLCH(hsi.toRGB(color));
  },

  parse(input: string): HSI | undefined {
    const reRGB = re`^hsi${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;
    if ((match = reRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return hsi.toHSI({
          h: getAngle(match[1]),
          s: getPercent(match[2], 100),
          i: getPercent(match[3], 100),
          alpha: getPercent(match[4], 1),
        });
      }

      return hsi.toHSI({
        h: getAngle(match[1]),
        s: getPercent(match[2], 100),
        i: getPercent(match[3], 100),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialHSI, options: StringOptions): string {
    const color = hsi.external(hsi.internal(input));

    if (options.format === 'name' || options.format === 'hex' || options.format === 'css') {
      return rgb.string(hsi.toRGB(color), options);
    }

    if (color.alpha) {
      return `hsi(${color.h} ${color.s}% ${color.i}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `hsi(${color.h} ${color.s}% ${color.i}%)`;
  },
};
