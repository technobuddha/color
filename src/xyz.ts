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
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { lab } from './lab.ts';
import { rgb } from './rgb.ts';
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
} from './util.ts';

const testXYZ = re`^xyz${reOp}${reNumber}${reSep}${reNumber}${reSep}${reNumber}${reAlpha}${reCp}$`;
const testColor = re`^color${reOp}xyz${reSpace}${reNumber}${reSep}${reNumber}${reSep}${reNumber}${reAlpha}${reCp}$`;

type OXYZ = { x: number; y: number; z: number };
type IXYZ = { X: number; Y: number; Z: number };
type InternalXYZ = Alpha & IXYZ;
export type PartialXYZ = Alpha & (IXYZ | OXYZ | (IXYZ & OXYZ));
export type XYZ = Alpha & IXYZ & OXYZ;

export const xyz: ColorSpace<XYZ, PartialXYZ, InternalXYZ> = {
  is: (color: PartialColor): color is PartialXYZ =>
    ('x' in color && 'y' in color && 'z' in color) ||
    ('X' in color && 'Y' in color && 'Z' in color),

  internal(color: PartialXYZ): InternalXYZ {
    if ('X' in color && 'Y' in color && 'Z' in color) {
      return { X: color.X, Y: color.Y, Z: color.Z, alpha: color.alpha };
    }
    return { X: color.x / 100, Y: color.y / 100, Z: color.z / 100, alpha: color.alpha };
  },

  external({ X, Y, Z, alpha }: InternalXYZ): XYZ {
    const obj = {
      x: round(X * 100, 3),
      y: round(Y * 100, 3),
      z: round(Z * 100, 3),
      X,
      Y,
      Z,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialXYZ): RGB {
    const { X, Y, Z, alpha } = xyz.internal(color);
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
  },

  toHSL: (color: PartialXYZ): HSL => rgb.toHSL(xyz.toRGB(color)),

  toHSV: (color: PartialXYZ): HSV => rgb.toHSV(xyz.toRGB(color)),

  toHSI: (color: PartialXYZ): HSI => rgb.toHSI(xyz.toRGB(color)),

  toHWB: (color: PartialXYZ): HWB => rgb.toHWB(xyz.toRGB(color)),

  toHCG: (color: PartialXYZ): HCG => rgb.toHCG(xyz.toRGB(color)),

  toCMY: (color: PartialXYZ): CMY => rgb.toCMY(xyz.toRGB(color)),

  toCMYK: (color: PartialXYZ): CMYK => rgb.toCMYK(xyz.toRGB(color)),

  toXYZ: (color: PartialXYZ): XYZ => xyz.external(xyz.internal(color)),

  toLAB(color: PartialXYZ): LAB {
    let { X, Y, Z, alpha } = xyz.internal(color);
    X /= 0.95047;
    Z /= 1.08883;

    X = X > 216 / 24389 ? X ** (1 / 3) : ((24389 / 27) * X + 16) / 116;
    Y = Y > 216 / 24389 ? Y ** (1 / 3) : ((24389 / 27) * Y + 16) / 116;
    Z = Z > 216 / 24389 ? Z ** (1 / 3) : ((24389 / 27) * Z + 16) / 116;

    const lightness = 1.16 * Y - 0.16;
    const redGreen = 5.0 * (X - Y);
    const blueYellow = 2.0 * (Y - Z);

    return lab.external({ lightness, redGreen, blueYellow, alpha });
  },

  toLCH: (color: PartialXYZ): LCH => lab.toLCH(xyz.toLAB(color)),

  parse(input: string): XYZ | undefined {
    let match: RegExpMatchArray | null;
    // eslint-disable-next-line no-useless-assignment
    if ((match = testXYZ.exec(input) ?? (match = testColor.exec(input)))) {
      //#region XYZ
      if (match[4]) {
        return xyz.toXYZ({
          x: getNumber(match[1]),
          y: getNumber(match[2]),
          z: getNumber(match[3]),
          alpha: getPercent(match[4], 1),
        });
      }

      return xyz.toXYZ({
        x: getNumber(match[1]),
        y: getNumber(match[2]),
        z: getNumber(match[3]),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialXYZ, options: StringOptions): string {
    const color = xyz.external(xyz.internal(input));
    if (
      options.format === 'name' ||
      options.format === 'hex' ||
      (options.format === 'css' && options.cssVersion === 3)
    ) {
      return rgb.string(xyz.toRGB(color), options);
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
  },
};
