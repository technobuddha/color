import {
  type Alpha,
  type CMY,
  type CMYK,
  type HCG,
  type HSI,
  type HSL,
  type HWB,
  type LAB,
  type LCH,
  type PartialColor,
  type RGB,
  type StringOptions,
  type XYZ,
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { hcg } from './hcg.ts';
import { hsl } from './hsl.ts';
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

type OHSV = { h: number; s: number; v: number };
type IHSV = { hue: number; saturation: number; value: number };
type InternalHSV = Alpha & IHSV;
export type PartialHSV = Alpha & (IHSV | OHSV | (IHSV & OHSV));
export type HSV = Alpha & IHSV & OHSV;

export const hsv: ColorSpace<HSV, PartialHSV, InternalHSV> = {
  is(color: PartialColor): color is PartialHSV {
    return (
      ('h' in color && 's' in color && 'v' in color) ||
      ('hue' in color && 'saturation' in color && 'value' in color)
    );
  },

  internal(color: PartialHSV): InternalHSV {
    if ('hue' in color && 'saturation' in color && 'value' in color) {
      return {
        hue: color.hue,
        saturation: color.saturation,
        value: color.value,
        alpha: color.alpha,
      };
    }
    return {
      hue: color.h / 360,
      saturation: color.s / 100,
      value: color.v / 100,
      alpha: color.alpha,
    };
  },

  external({ hue, saturation, value, alpha }: InternalHSV): HSV {
    const obj = {
      h: round(hue * 360, 2),
      s: round(saturation * 100, 2),
      v: round(value * 100, 2),
      hue,
      saturation,
      value,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialHSV): RGB {
    let { hue, saturation, value, alpha } = hsv.internal(color);
    hue *= 6;
    const hi = Math.floor(hue) % 6;

    const f = hue - Math.floor(hue);
    const p = value * (1 - saturation);
    const q = value * (1 - saturation * f);
    const t = value * (1 - saturation * (1 - f));
    const v = value;

    switch (hi) {
      case 0: {
        return rgb.external({ red: v, green: t, blue: p, alpha });
      }
      case 1: {
        return rgb.external({ red: q, green: v, blue: p, alpha });
      }
      case 2: {
        return rgb.external({ red: p, green: v, blue: t, alpha });
      }
      case 3: {
        return rgb.external({ red: p, green: q, blue: v, alpha });
      }
      case 4: {
        return rgb.external({ red: t, green: p, blue: v, alpha });
      }
      default: {
        return rgb.external({ red: v, green: p, blue: q, alpha });
      }
    }
  },

  toHSL(color: PartialHSV): HSL {
    let { hue, saturation, value, alpha } = hsv.internal(color);
    const vMin = Math.max(value, 0.01);

    let lightness = (2 - saturation) * value;
    const lMin = (2 - saturation) * vMin;
    saturation *= vMin;

    saturation /= lMin <= 1 ? lMin : 2 - lMin;
    saturation = saturation || 0;
    lightness /= 2;

    return hsl.external({ hue, saturation, lightness, alpha });
  },

  toHSV(color: PartialHSV): HSV {
    return hsv.external(hsv.internal(color));
  },

  toHSI(color: PartialHSV): HSI {
    return rgb.toHSI(hsv.toRGB(color));
  },

  toHWB(color: PartialHSV): HWB {
    return hcg.toHWB(hsv.toHCG(color));
  },

  toHCG(color: PartialHSV): HCG {
    const { hue, saturation, value, alpha } = hsv.internal(color);

    const chroma = saturation * value;
    let greyness = 0;

    if (chroma < 1.0) {
      greyness = (value - chroma) / (1 - chroma);
    }

    return hcg.external({ hue, chroma, greyness, alpha });
  },

  toCMY(color: PartialHSV): CMY {
    return rgb.toCMY(hsv.toRGB(color));
  },

  toCMYK(color: PartialHSV): CMYK {
    return rgb.toCMYK(hsv.toRGB(color));
  },

  toXYZ(color: PartialHSV): XYZ {
    return rgb.toXYZ(hsv.toRGB(color));
  },

  toLAB(color: PartialHSV): LAB {
    return rgb.toLAB(hsv.toRGB(color));
  },

  toLCH(color: PartialHSV): LCH {
    return lab.toLCH(hsv.toLAB(color));
  },

  parse(input: string): HSV | undefined {
    const reRGB = re`^hsv${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;
    if ((match = reRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return hsv.toHSV({
          h: getAngle(match[1]),
          s: getPercent(match[2], 100),
          v: getPercent(match[3], 100),
          alpha: getPercent(match[4], 1),
        });
      }

      return hsv.toHSV({
        h: getAngle(match[1]),
        s: getPercent(match[2], 100),
        v: getPercent(match[3], 100),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialHSV, options: StringOptions): string {
    const color = hsv.external(hsv.internal(input));

    if (options.format === 'name' || options.format === 'hex' || options.format === 'css') {
      return rgb.string(hsv.toRGB(color), options);
    }

    if (color.alpha) {
      return `hsv(${color.h} ${color.s}% ${color.v}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `hsv(${color.h} ${color.s}% ${color.v}%)`;
  },
};
