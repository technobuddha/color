/* eslint-disable @typescript-eslint/naming-convention */
import {
  type Alpha,
  type CMY,
  type CMYK,
  type HCG,
  type HSI,
  type HSL,
  type HSV,
  type HWB,
  type LAB,
  type LCH,
  type PartialColor,
  type RGB,
  type StringOptions,
} from './color.js';
import { type ColorSpace } from './color-space.js';
import lab from './lab.js';
import rgb from './rgb.js';
import {
  getNumber,
  getPercent,
  re,
  reAlpha,
  reCp,
  reNumber,
  reOp,
  reSep,
  reSpace,
  round,
} from './util.js';

type OXYZ = { x: number; y: number; z: number };
type IXYZ = { X: number; Y: number; Z: number };
type InternalXYZ = Alpha & IXYZ;
export type PartialXYZ = Alpha & (IXYZ | OXYZ | (IXYZ & OXYZ));
export type XYZ = Alpha & IXYZ & OXYZ;

export function is(color: PartialColor): color is PartialXYZ {
  return (
    ('x' in color && 'y' in color && 'z' in color) || ('X' in color && 'Y' in color && 'Z' in color)
  );
}

export function internal(color: PartialXYZ): InternalXYZ {
  if ('X' in color && 'Y' in color && 'Z' in color) {
    return { X: color.X, Y: color.Y, Z: color.Z, alpha: color.alpha };
  }
  return { X: color.x / 100, Y: color.y / 100, Z: color.z / 100, alpha: color.alpha };
}

export function external({ X, Y, Z, alpha }: InternalXYZ): XYZ {
  const obj = {
    x: round(X * 100, 3),
    y: round(Y * 100, 3),
    z: round(Z * 100, 3),
    X,
    Y,
    Z,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialXYZ): RGB {
  const { X, Y, Z, alpha } = internal(color);
  let red = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  let green = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  let blue = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

  // Assume sRGB
  red = red > 0.0031308 ? 1.055 * red ** (1.0 / 2.4) - 0.055 : red * 12.92;

  green = green > 0.0031308 ? 1.055 * green ** (1.0 / 2.4) - 0.055 : green * 12.92;

  blue = blue > 0.0031308 ? 1.055 * blue ** (1.0 / 2.4) - 0.055 : blue * 12.92;

  red = Math.min(Math.max(0, red), 1);
  green = Math.min(Math.max(0, green), 1);
  blue = Math.min(Math.max(0, blue), 1);

  return rgb.external({ red, green, blue, alpha });
}

export function toHSL(color: PartialXYZ): HSL {
  return rgb.toHSL(toRGB(color));
}

export function toHSV(color: PartialXYZ): HSV {
  return rgb.toHSV(toRGB(color));
}

export function toHSI(color: PartialXYZ): HSI {
  return rgb.toHSI(toRGB(color));
}

export function toHWB(color: PartialXYZ): HWB {
  return rgb.toHWB(toRGB(color));
}

export function toHCG(color: PartialXYZ): HCG {
  return rgb.toHCG(toRGB(color));
}

export function toCMY(color: PartialXYZ): CMY {
  return rgb.toCMY(toRGB(color));
}

export function toCMYK(color: PartialXYZ): CMYK {
  return rgb.toCMYK(toRGB(color));
}

export function toXYZ(color: PartialXYZ): XYZ {
  return external(internal(color));
}

export function toLAB(color: PartialXYZ): LAB {
  let { X, Y, Z, alpha } = internal(color);
  X /= 0.95047;
  Y /= 1.0;
  Z /= 1.08883;

  X = X > 216 / 24389 ? X ** (1 / 3) : ((24389 / 27) * X + 16) / 116;
  Y = Y > 216 / 24389 ? Y ** (1 / 3) : ((24389 / 27) * Y + 16) / 116;
  Z = Z > 216 / 24389 ? Z ** (1 / 3) : ((24389 / 27) * Z + 16) / 116;

  const lightness = 1.16 * Y - 0.16;
  const redGreen = 5.0 * (X - Y);
  const blueYellow = 2.0 * (Y - Z);

  return lab.external({ lightness, redGreen, blueYellow, alpha });
}

export function toLCH(color: PartialXYZ): LCH {
  return lab.toLCH(toLAB(color));
}

const testXYZ = re`^xyz${reOp}${reNumber}${reSep}${reNumber}${reSep}${reNumber}${reAlpha}${reCp}$`;
const testColor = re`^color${reOp}xyz${reSpace}${reNumber}${reSep}${reNumber}${reSep}${reNumber}${reAlpha}${reCp}$`;

export function parse(input: string): XYZ | undefined {
  let match: RegExpMatchArray | null;
  if ((match = testXYZ.exec(input) ?? (match = testColor.exec(input)))) {
    //#region XYZ
    if (match[4]) {
      return toXYZ({
        x: getNumber(match[1]),
        y: getNumber(match[2]),
        z: getNumber(match[3]),
        alpha: getPercent(match[4], 1),
      });
    }

    return toXYZ({
      x: getNumber(match[1]),
      y: getNumber(match[2]),
      z: getNumber(match[3]),
    });
    //#endregion
  }

  return undefined;
}

export function string(input: PartialXYZ, options: StringOptions): string {
  const color = external(internal(input));

  if (
    options.format === 'name' ||
    options.format === 'hex' ||
    (options.format === 'css' && options.cssVersion === 3)
  ) {
    return rgb.string(toRGB(color), options);
  }

  if (options.format === 'css') {
    if (color.alpha) {
      return `color(xyz ${color.x / 100} ${color.y / 100} ${color.z / 100} / ${round(color.alpha, 2)})`;
    }
    return `color(xyz ${color.x / 100} ${color.y / 100} ${color.z / 100})`;
  }

  if (color.alpha) {
    return `xyz(${color.x} ${color.y} ${color.z} / ${round(color.alpha * 100, 2)}%)`;
  }
  return `xyz(${color.x} ${color.y} ${color.z})`;
}

const xyz: ColorSpace<XYZ, PartialXYZ, InternalXYZ> = {
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

export default xyz;
