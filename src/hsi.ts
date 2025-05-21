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
} from './color.js';
import { type ColorSpace } from './color-space.js';
import rgb from './rgb.js';
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
} from './util.js';

type OHSI = { h: number; s: number; i: number };
type IHSI = { hue: number; saturation: number; intensity: number };
type InternalHSI = Alpha & IHSI;
export type PartialHSI = Alpha & (IHSI | OHSI | (IHSI & OHSI));
export type HSI = Alpha & IHSI & OHSI;

export function is(color: PartialColor): color is PartialHSI {
  return (
    ('h' in color && 's' in color && 'i' in color) ||
    ('hue' in color && 'saturation' in color && 'intensity' in color)
  );
}

export function internal(color: PartialHSI): InternalHSI {
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
}

export function external({ hue, saturation, intensity, alpha }: InternalHSI): HSI {
  const obj = {
    h: round(hue * 360, 2),
    s: round(saturation * 100, 2),
    i: round(intensity * 100, 2),
    hue,
    saturation,
    intensity,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialHSI): RGB {
  const { hue, saturation, intensity, alpha } = internal(color);
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
}

export function toHSL(color: PartialHSI): HSL {
  return rgb.toHSL(toRGB(color));
}

export function toHSV(color: PartialHSI): HSV {
  return rgb.toHSV(toRGB(color));
}

export function toHSI(color: PartialHSI): HSI {
  return external(internal(color));
}

export function toHWB(color: PartialHSI): HWB {
  return rgb.toHWB(toRGB(color));
}

export function toHCG(color: PartialHSI): HCG {
  return rgb.toHCG(toRGB(color));
}

export function toCMY(color: PartialHSI): CMY {
  return rgb.toCMY(toRGB(color));
}

export function toCMYK(color: PartialHSI): CMYK {
  return rgb.toCMYK(toRGB(color));
}

export function toXYZ(color: PartialHSI): XYZ {
  return rgb.toXYZ(toRGB(color));
}

export function toLAB(color: PartialHSI): LAB {
  return rgb.toLAB(toRGB(color));
}

export function toLCH(color: PartialHSI): LCH {
  return rgb.toLCH(toRGB(color));
}

export function parse(input: string): HSI | undefined {
  const reRGB = re`^hsi${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

  let match: RegExpMatchArray | null;
  if ((match = reRGB.exec(input))) {
    //#region RGB
    if (match[4]) {
      return toHSI({
        h: getAngle(match[1]),
        s: getPercent(match[2], 100),
        i: getPercent(match[3], 100),
        alpha: getPercent(match[4], 1),
      });
    }

    return toHSI({
      h: getAngle(match[1]),
      s: getPercent(match[2], 100),
      i: getPercent(match[3], 100),
    });
    //#endregion
  }

  return undefined;
}

export function string(input: PartialHSI, options: StringOptions): string {
  const color = external(internal(input));

  if (options.format === 'name' || options.format === 'hex' || options.format === 'css') {
    return rgb.string(toRGB(color), options);
  }

  if (color.alpha) {
    return `hsi(${color.h} ${color.s}% ${color.i}% / ${round(color.alpha * 100, 2)}%)`;
  }
  return `hsi(${color.h} ${color.s}% ${color.i}%)`;
}

const hsi: ColorSpace<HSI, PartialHSI, InternalHSI> = {
  is,

  internal,
  external,

  toRGB,
  toHSL,
  toHSV,
  toHSI,
  toHWB,
  toHCG,
  toCMY,
  toCMYK,
  toXYZ,
  toLAB,
  toLCH,

  parse,
  string,
};

export default hsi;
