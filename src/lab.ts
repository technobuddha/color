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
} from './color.js';
import { type ColorSpace } from './color-space.js';
import lch from './lch.js';
import rgb from './rgb.js';
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
} from './util.js';
import xyz from './xyz.js';

type OLAB = { l: number; a: number; b: number };
type ILAB = { lightness: number; redGreen: number; blueYellow: number };
type InternalLAB = Alpha & ILAB;
export type PartialLAB = Alpha & (ILAB | OLAB | (ILAB & OLAB));
export type LAB = Alpha & ILAB & OLAB;

export function is(color: PartialColor): color is PartialLAB {
  return (
    ('l' in color && 'a' in color && 'b' in color) ||
    ('lightness' in color && 'redGreen' in color && 'blueYellow' in color)
  );
}

export function internal(color: PartialLAB): InternalLAB {
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
}

export function external({ lightness, redGreen, blueYellow, alpha }: InternalLAB): LAB {
  const obj = {
    l: round(lightness * 100, 2),
    a: round(redGreen * 100, 2),
    b: round(blueYellow * 100, 2),
    lightness,
    redGreen,
    blueYellow,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialLAB): RGB {
  return xyz.toRGB(toXYZ(color));
}

export function toHSL(color: PartialLAB): HSL {
  return rgb.toHSL(xyz.toRGB(toXYZ(color)));
}

export function toHSV(color: PartialLAB): HSV {
  return rgb.toHSV(xyz.toRGB(toXYZ(color)));
}

export function toHSI(color: PartialLAB): HSI {
  return rgb.toHSI(toRGB(color));
}

export function toHWB(color: PartialLAB): HWB {
  return rgb.toHWB(xyz.toRGB(toXYZ(color)));
}

export function toHCG(color: PartialLAB): HCG {
  return rgb.toHCG(toRGB(color));
}

export function toCMY(color: PartialLAB): CMY {
  return rgb.toCMY(toRGB(color));
}

export function toCMYK(color: PartialLAB): CMYK {
  return rgb.toCMYK(xyz.toRGB(toXYZ(color)));
}

export function toXYZ(color: PartialLAB): XYZ {
  const { lightness, redGreen, blueYellow, alpha } = internal(color);

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
  Y *= 1.0;
  Z *= 1.08883;

  return xyz.external({ X, Y, Z, alpha });
}

export function toLAB(color: PartialLAB): LAB {
  return external(internal(color));
}

export function toLCH(color: PartialLAB): LCH {
  const { lightness, redGreen, blueYellow, alpha } = internal(color);

  let hue = approxEq(redGreen, 0) && approxEq(blueYellow, 0) ? 0 : Math.atan2(blueYellow, redGreen);
  hue = hue > 0 ? hue / (Math.PI * 2) : 1 - Math.abs(hue / (Math.PI * 2));
  if (hue >= 1) {
    hue -= 1;
  }

  const chroma = Math.hypot(redGreen, blueYellow);

  return lch.external({ lightness, chroma, hue, alpha });
}

export function parse(input: string): LAB | undefined {
  const reRGB = re`^lab${reOp}${rePercent}${reSep}${reNumber}${reSep}${reNumber}${reAlpha}${reCp}$`;

  let match: RegExpMatchArray | null;

  if ((match = reRGB.exec(input))) {
    //#region RGB
    if (match[4]) {
      return toLAB({
        l: getPercent(match[1], 100),
        a: getNumber(match[2]),
        b: getNumber(match[3]),
        alpha: getPercent(match[4], 1),
      });
    }

    return toLAB({
      l: getPercent(match[1], 100),
      a: getNumber(match[2]),
      b: getNumber(match[3]),
    });
    //#endregion
  }

  return undefined;
}

export function string(input: PartialLAB, options: StringOptions): string {
  const color = external(internal(input));

  if (
    options.format === 'name' ||
    options.format === 'hex' ||
    (options.format === 'css' && options.cssVersion === 3)
  ) {
    return rgb.string(toRGB(color), options);
  }

  if (color.alpha) {
    return `lab(${color.l}% ${color.a} ${color.b} / ${round(color.alpha * 100, 2)}%)`;
  }
  return `lab(${color.l}% ${color.a} ${color.b})`;
}

const lab: ColorSpace<LAB, PartialLAB, InternalLAB> = {
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

export default lab;
