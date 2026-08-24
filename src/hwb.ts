import {
  type Alpha,
  type CMY,
  type CMYK,
  type HCG,
  type HSI,
  type HSL,
  type HSV,
  type LAB,
  type LCH,
  type PartialColor,
  type RGB,
  type StringOptions,
  type XYZ,
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { hcg } from './hcg.ts';
import { lab } from './lab.ts';
import { rgb } from './rgb.ts';
import {
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

type OHWB = { h: number; w: number; b: number };
type IHWB = { hue: number; whiteness: number; blackness: number };
type InternalHWB = Alpha & IHWB;
export type PartialHWB = Alpha & (IHWB | OHWB | (IHWB & OHWB));
export type HWB = Alpha & IHWB & OHWB;

export const hwb: ColorSpace<HWB, PartialHWB, InternalHWB> = {
  is: (color: PartialColor): color is PartialHWB =>
    ('h' in color && 'w' in color && 'b' in color) ||
    ('hue' in color && 'whiteness' in color && 'blackness' in color),

  internal(color: PartialHWB): InternalHWB {
    if ('hue' in color && 'whiteness' in color && 'blackness' in color) {
      return {
        hue: color.hue,
        whiteness: color.whiteness,
        blackness: color.blackness,
        alpha: color.alpha,
      };
    }
    return {
      hue: color.h / 360,
      whiteness: color.w / 100,
      blackness: color.b / 100,
      alpha: color.alpha,
    };
  },

  external({ hue, whiteness, blackness, alpha }: InternalHWB): HWB {
    const obj = {
      h: round(hue * 360, 2),
      w: round(whiteness * 100, 2),
      b: round(blackness * 100, 2),
      hue,
      whiteness,
      blackness,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialHWB): RGB {
    let { hue, whiteness, blackness, alpha } = hwb.internal(color);
    const ratio = whiteness + blackness;

    // Wh + bl cant be > 1
    if (ratio > 1) {
      whiteness /= ratio;
      blackness /= ratio;
    }

    const i = Math.floor(6 * hue);
    const v = 1 - blackness;
    let f = 6 * hue - i;

    if ((i & 0x01) !== 0) {
      f = 1 - f;
    }

    const n = whiteness + f * (v - whiteness); // Linear interpolation

    let red: number;
    let green: number;
    let blue: number;
    switch (i) {
      case 0: {
        red = v;
        green = n;
        blue = whiteness;
        break;
      }
      case 1: {
        red = n;
        green = v;
        blue = whiteness;
        break;
      }
      case 2: {
        red = whiteness;
        green = v;
        blue = n;
        break;
      }
      case 3: {
        red = whiteness;
        green = n;
        blue = v;
        break;
      }
      case 4: {
        red = n;
        green = whiteness;
        blue = v;
        break;
      }
      default: {
        red = v;
        green = whiteness;
        blue = n;
        break;
      }
    }

    return rgb.external({ red, green, blue, alpha });
  },

  toHSL: (color: PartialHWB): HSL => rgb.toHSL(hwb.toRGB(color)),

  toHSV: (color: PartialHWB): HSV => rgb.toHSV(hwb.toRGB(color)),

  toHSI: (color: PartialHWB): HSI => rgb.toHSI(hwb.toRGB(color)),

  toHWB: (color: PartialHWB): HWB => hwb.external(hwb.internal(color)),

  toHCG(color: PartialHWB): HCG {
    const { hue, whiteness, blackness, alpha } = hwb.internal(color);
    const v = 1 - blackness;
    const chroma = v - whiteness;
    const greyness = chroma < 1 ? (v - chroma) / (1 - chroma) : 0;

    return hcg.external({ hue, chroma, greyness, alpha });
  },

  toCMY: (color: PartialHWB): CMY => rgb.toCMY(hwb.toRGB(color)),

  toCMYK: (color: PartialHWB): CMYK => rgb.toCMYK(hwb.toRGB(color)),

  toXYZ: (color: PartialHWB): XYZ => rgb.toXYZ(hwb.toRGB(color)),

  toLAB: (color: PartialHWB): LAB => rgb.toLAB(hwb.toRGB(color)),

  toLCH: (color: PartialHWB): LCH => lab.toLCH(hwb.toLAB(color)),

  parse(input: string): HWB | undefined {
    const reRGB = re`^hwb${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;
    if ((match = reRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return hwb.toHWB({
          h: getAngle(match[1]),
          w: getPercent(match[2], 100),
          b: getPercent(match[3], 100),
          alpha: getPercent(match[4], 1),
        });
      }

      return hwb.toHWB({
        h: getAngle(match[1]),
        w: getPercent(match[2], 100),
        b: getPercent(match[3], 100),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialHWB, options: StringOptions): string {
    const color = hwb.external(hwb.internal(input));

    if (
      options.format === 'name' ||
      options.format === 'hex' ||
      (options.format === 'css' && options.cssVersion === 3)
    ) {
      return rgb.string(hwb.toRGB(color), options);
    }

    if (color.alpha) {
      return `hwb(${color.h} ${color.w}% ${color.b}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `hwb(${color.h} ${color.w}% ${color.b}%)`;
  },
};
