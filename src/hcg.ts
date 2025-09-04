import {
  type Alpha,
  type CMY,
  type CMYK,
  type HSI,
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
import { hsl } from './hsl.ts';
import { hsv } from './hsv.ts';
import { hwb } from './hwb.ts';
import { lab } from './lab.ts';
import { rgb } from './rgb.ts';
import {
  getAngle,
  getPercent,
  modulo,
  re,
  reAlpha,
  reAngle,
  reCp,
  reOp,
  rePercent,
  reSep,
  round,
} from './util.ts';

type OHCG = { h: number; c: number; g: number };
type IHGC = { hue: number; chroma: number; greyness: number };
type InternalHCG = Alpha & IHGC;
export type PartialHCG = Alpha & (IHGC | OHCG | (IHGC & OHCG));
export type HCG = Alpha & IHGC & OHCG;

export const hcg: ColorSpace<HCG, PartialHCG, InternalHCG> = {
  is(color: PartialColor): color is PartialHCG {
    return (
      ('h' in color && 'c' in color && 'g' in color) ||
      ('hue' in color && 'chroma' in color && 'greyness' in color)
    );
  },

  internal(color: PartialHCG): InternalHCG {
    if ('hue' in color && 'chroma' in color && 'greyness' in color) {
      return { hue: color.hue, chroma: color.chroma, greyness: color.greyness, alpha: color.alpha };
    }
    return {
      hue: color.h / 360,
      chroma: color.c / 100,
      greyness: color.g / 100,
      alpha: color.alpha,
    };
  },

  external({ hue, chroma, greyness, alpha }: InternalHCG): HCG {
    const obj = {
      h: round(hue * 360, 2),
      c: round(chroma * 100, 2),
      g: round(greyness * 100, 2),
      hue,
      chroma,
      greyness,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialHCG): RGB {
    const { hue, chroma, greyness, alpha } = hcg.internal(color);

    const h = hue * 6;
    const redGreenBlue = Array.from([h, h, h]).map((v, i) => {
      const a = modulo(v - i * 2, 6.0);
      const b = Math.abs(a - 3.0) - 1.0;
      return Math.min(Math.max(b, 0.0), 1.0);
    }) as [number, number, number];
    const m = greyness * (1 - chroma);

    const [red, green, blue] = redGreenBlue.map((ch) => ch * chroma + m) as [
      number,
      number,
      number,
    ];
    return rgb.external({ red, green, blue, alpha });
  },

  toHSL(color: PartialHCG): HSL {
    const { hue, chroma, greyness, alpha } = hcg.internal(color);

    const lightness = greyness * (1.0 - chroma) + 0.5 * chroma;
    let saturation = 0;

    if (lightness > 0.0 && lightness < 0.5) {
      saturation = chroma / (2 * lightness);
    } else if (lightness >= 0.5 && lightness < 1.0) {
      saturation = chroma / (2 * (1 - lightness));
    }

    return hsl.external({ hue, saturation, lightness, alpha });
  },

  toHSV(color: PartialHCG): HSV {
    const { hue, chroma, greyness, alpha } = hcg.internal(color);

    const value = chroma + greyness * (1.0 - chroma);
    let saturation = 0;

    if (value > 0.0) {
      saturation = chroma / value;
    }

    return hsv.external({ hue, saturation, value, alpha });
  },

  toHSI(color: PartialHCG): HSI {
    return rgb.toHSI(hcg.toRGB(color));
  },

  toHWB(color: PartialHCG): HWB {
    const { hue, chroma, greyness, alpha } = hcg.internal(color);
    const v = chroma + greyness * (1.0 - chroma);
    const whiteness = v - chroma;
    const blackness = 1 - v;
    return hwb.external({ hue, whiteness, blackness, alpha });
  },

  toHCG(color: PartialHCG): HCG {
    return hcg.external(hcg.internal(color));
  },

  toCMY(color: PartialHCG): CMY {
    return rgb.toCMY(hcg.toRGB(color));
  },

  toCMYK(color: PartialHCG): CMYK {
    return rgb.toCMYK(hcg.toRGB(color));
  },

  toXYZ(color: PartialHCG): XYZ {
    return rgb.toXYZ(hcg.toRGB(color));
  },

  toLAB(color: PartialHCG): LAB {
    return rgb.toLAB(hcg.toRGB(color));
  },

  toLCH(color: PartialHCG): LCH {
    return lab.toLCH(hcg.toLAB(color));
  },

  parse(input: string): HCG | undefined {
    const reRGB = re`^hcg${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;

    if ((match = reRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return hcg.toHCG({
          h: getAngle(match[1]),
          c: getPercent(match[2], 100),
          g: getPercent(match[3], 100),
          alpha: getPercent(match[4], 1),
        });
      }

      return hcg.toHCG({
        h: getAngle(match[1]),
        c: getPercent(match[2], 100),
        g: getPercent(match[3], 100),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialHCG, options: StringOptions): string {
    const color = hcg.external(hcg.internal(input));

    if (options.format === 'name' || options.format === 'hex' || options.format === 'css') {
      return rgb.string(hcg.toRGB(color), options);
    }

    if (color.alpha) {
      return `hcg(${color.h} ${color.c}% ${color.g}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `hcg(${color.h} ${color.c}% ${color.g}%)`;
  },
};
