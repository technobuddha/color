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
  type PartialColor,
  type RGB,
  type StringOptions,
  type XYZ,
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { lab } from './lab.ts';
import { rgb } from './rgb.ts';
import {
  getAngle,
  getNumber,
  getPercent,
  re,
  reAlpha,
  reAngle,
  reCp,
  reNumber,
  reOp,
  rePercent,
  reSep,
  round,
} from './util.ts';

type OLCH = { l: number; c: number; h: number };
type ILCH = { lightness: number; chroma: number; hue: number };
type InternalLCH = Alpha & ILCH;
export type PartialLCH = Alpha & (ILCH | OLCH | (ILCH & OLCH));
export type LCH = Alpha & ILCH & OLCH;

export const lch: ColorSpace<LCH, PartialLCH, InternalLCH> = {
  is: (color: PartialColor): color is PartialLCH =>
    ('l' in color && 'c' in color && 'h' in color) ||
    ('lightness' in color && 'chroma' in color && 'hue' in color),

  internal(color: PartialLCH): InternalLCH {
    if ('lightness' in color && 'chroma' in color && 'hue' in color) {
      return {
        lightness: color.lightness,
        chroma: color.chroma,
        hue: color.hue,
        alpha: color.alpha,
      };
    }
    return {
      lightness: color.l / 100,
      chroma: color.c / 100,
      hue: color.h / 360,
      alpha: color.alpha,
    };
  },

  external({ lightness, chroma, hue, alpha }: InternalLCH): LCH {
    const obj = {
      l: round(lightness * 100, 2),
      c: round(chroma * 100, 2),
      h: round(hue * 360, 2),
      lightness,
      chroma,
      hue,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB: (color: PartialLCH): RGB => lab.toRGB(lch.toLAB(color)),

  toHSL: (color: PartialLCH): HSL => rgb.toHSL(lab.toRGB(lch.toLAB(color))),

  toHSV: (color: PartialLCH): HSV => rgb.toHSV(lab.toRGB(lch.toLAB(color))),

  toHWB: (color: PartialLCH): HWB => rgb.toHWB(lab.toRGB(lch.toLAB(color))),

  toHSI: (color: PartialLCH): HSI => rgb.toHSI(lch.toRGB(color)),

  toHCG: (color: PartialLCH): HCG => rgb.toHCG(lab.toRGB(lch.toLAB(color))),

  toCMY: (color: PartialLCH): CMY => rgb.toCMY(lch.toRGB(color)),

  toCMYK: (color: PartialLCH): CMYK => rgb.toCMYK(lab.toRGB(lch.toLAB(color))),

  toXYZ: (color: PartialLCH): XYZ => lab.toXYZ(lch.toLAB(color)),

  toLAB(color: PartialLCH): LAB {
    const { lightness, chroma, hue, alpha } = lch.internal(color);

    const hr = hue * (2 * Math.PI);
    const redGreen = chroma * Math.cos(hr);
    const blueYellow = chroma * Math.sin(hr);

    return lab.external({ lightness, redGreen, blueYellow, alpha });
  },

  toLCH: (color: PartialLCH): LCH => lch.external(lch.internal(color)),

  parse(input: string): LCH | undefined {
    const reRGB = re`^lch${reOp}${rePercent}${reSep}${reNumber}${reSep}${reAngle}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;

    if ((match = reRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return lch.toLCH({
          l: getPercent(match[1], 100),
          c: getNumber(match[2]),
          h: getAngle(match[3]),
          alpha: getPercent(match[4], 1),
        });
      }

      return lch.toLCH({
        l: getPercent(match[1], 100),
        c: getNumber(match[2]),
        h: getAngle(match[3]),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialLCH, options: StringOptions): string {
    const color = lch.external(lch.internal(input));

    if (
      options.format === 'name' ||
      options.format === 'hex' ||
      (options.format === 'css' && options.cssVersion === 3)
    ) {
      return rgb.string(lch.toRGB(color), options);
    }

    if (color.alpha) {
      return `lch(${color.l}% ${color.c} ${color.h} / ${round(color.alpha * 100, 2)}%)`;
    }
    return `lch(${color.l}% ${color.c} ${color.h})`;
  },
};
