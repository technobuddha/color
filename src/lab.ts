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
  type LCH,
  type PartialColor,
  type RGB,
  type StringOptions,
  type XYZ,
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { lch } from './lch.ts';
import { rgb } from './rgb.ts';
import {
  approxEq,
  getNumber,
  getPercent,
  re,
  reAlpha,
  reCp,
  reNumber,
  reOp,
  rePercent,
  reSep,
  round,
} from './util.ts';
import { xyz } from './xyz.ts';

type OLAB = { l: number; a: number; b: number };
type ILAB = { lightness: number; redGreen: number; blueYellow: number };
type InternalLAB = Alpha & ILAB;
export type PartialLAB = Alpha & (ILAB | OLAB | (ILAB & OLAB));
export type LAB = Alpha & ILAB & OLAB;

export const lab: ColorSpace<LAB, PartialLAB, InternalLAB> = {
  is: (color: PartialColor): color is PartialLAB =>
    ('l' in color && 'a' in color && 'b' in color) ||
    ('lightness' in color && 'redGreen' in color && 'blueYellow' in color),

  internal(color: PartialLAB): InternalLAB {
    if ('lightness' in color && 'redGreen' in color && 'blueYellow' in color) {
      return {
        lightness: color.lightness,
        redGreen: color.redGreen,
        blueYellow: color.blueYellow,
        alpha: color.alpha,
      };
    }
    return {
      lightness: color.l / 100,
      redGreen: color.a / 100,
      blueYellow: color.b / 100,
      alpha: color.alpha,
    };
  },

  external({ lightness, redGreen, blueYellow, alpha }: InternalLAB): LAB {
    const obj = {
      l: round(lightness * 100, 2),
      a: round(redGreen * 100, 2),
      b: round(blueYellow * 100, 2),
      lightness,
      redGreen,
      blueYellow,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB: (color: PartialLAB): RGB => xyz.toRGB(lab.toXYZ(color)),

  toHSL: (color: PartialLAB): HSL => rgb.toHSL(xyz.toRGB(lab.toXYZ(color))),

  toHSV: (color: PartialLAB): HSV => rgb.toHSV(xyz.toRGB(lab.toXYZ(color))),

  toHSI: (color: PartialLAB): HSI => rgb.toHSI(lab.toRGB(color)),

  toHWB: (color: PartialLAB): HWB => rgb.toHWB(xyz.toRGB(lab.toXYZ(color))),

  toHCG: (color: PartialLAB): HCG => rgb.toHCG(lab.toRGB(color)),

  toCMY: (color: PartialLAB): CMY => rgb.toCMY(lab.toRGB(color)),

  toCMYK: (color: PartialLAB): CMYK => rgb.toCMYK(xyz.toRGB(lab.toXYZ(color))),

  toXYZ(color: PartialLAB): XYZ {
    const { lightness, redGreen, blueYellow, alpha } = lab.internal(color);

    let Y = (lightness * 100 + 16) / 116;
    let X = redGreen / 5 + Y;
    let Z = Y - blueYellow / 2;

    const Y2 = Y ** 3;
    const X2 = X ** 3;
    const Z2 = Z ** 3;

    Y = Y2 > 0.008856 ? Y2 : (Y - 16 / 116) / 7.787;
    X = X2 > 0.008856 ? X2 : (X - 16 / 116) / 7.787;
    Z = Z2 > 0.008856 ? Z2 : (Z - 16 / 116) / 7.787;

    X *= 0.95047;
    Z *= 1.08883;

    return xyz.external({ X, Y, Z, alpha });
  },

  toLAB: (color: PartialLAB): LAB => lab.external(lab.internal(color)),

  toLCH(color: PartialLAB): LCH {
    const { lightness, redGreen, blueYellow, alpha } = lab.internal(color);

    let hue =
      approxEq(redGreen, 0) && approxEq(blueYellow, 0) ? 0 : Math.atan2(blueYellow, redGreen);
    hue = hue > 0 ? hue / (Math.PI * 2) : 1 - Math.abs(hue / (Math.PI * 2));
    if (hue >= 1) {
      hue -= 1;
    }

    const chroma = Math.hypot(redGreen, blueYellow);

    return lch.external({ lightness, chroma, hue, alpha });
  },

  parse(input: string): LAB | undefined {
    const reRGB = re`^lab${reOp}${rePercent}${reSep}${reNumber}${reSep}${reNumber}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;

    if ((match = reRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return lab.toLAB({
          l: getPercent(match[1], 100),
          a: getNumber(match[2]),
          b: getNumber(match[3]),
          alpha: getPercent(match[4], 1),
        });
      }

      return lab.toLAB({
        l: getPercent(match[1], 100),
        a: getNumber(match[2]),
        b: getNumber(match[3]),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialLAB, options: StringOptions): string {
    const color = lab.external(lab.internal(input));

    if (
      options.format === 'name' ||
      options.format === 'hex' ||
      (options.format === 'css' && options.cssVersion === 3)
    ) {
      return rgb.string(lab.toRGB(color), options);
    }

    if (color.alpha) {
      return `lab(${color.l}% ${color.a} ${color.b} / ${round(color.alpha * 100, 2)}%)`;
    }
    return `lab(${color.l}% ${color.a} ${color.b})`;
  },
};
