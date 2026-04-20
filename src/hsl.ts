import {
  type Alpha,
  type CMY,
  type CMYK,
  type HCG,
  type HSI,
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
import { hcg } from './hcg.ts';
import { hsv } from './hsv.ts';
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

type OHSL = { h: number; s: number; l: number };
type IHSL = { hue: number; saturation: number; lightness: number };
type InternalHSL = Alpha & IHSL;
export type PartialHSL = Alpha & (IHSL | OHSL | (IHSL & OHSL));
export type HSL = Alpha & IHSL & OHSL;

const testHSL = re`^hsla?${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

export const hsl: ColorSpace<HSL, PartialHSL, InternalHSL> = {
  is(color: PartialColor): color is PartialHSL {
    return (
      ('h' in color && 's' in color && 'l' in color) ||
      ('hue' in color && 'saturation' in color && 'lightness' in color)
    );
  },

  internal(color: PartialHSL): InternalHSL {
    if ('hue' in color && 'saturation' in color && 'lightness' in color) {
      return {
        hue: color.hue,
        saturation: color.saturation,
        lightness: color.lightness,
        alpha: color.alpha,
      };
    }
    return {
      hue: color.h / 360,
      saturation: color.s / 100,
      lightness: color.l / 100,
      alpha: color.alpha,
    };
  },

  external({ hue, saturation, lightness, alpha }: InternalHSL): HSL {
    const obj = {
      h: round(hue * 360, 2),
      s: round(saturation * 100, 2),
      l: round(lightness * 100, 2),
      hue,
      saturation,
      lightness,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialHSL): RGB {
    const { hue, saturation, lightness, alpha } = hsl.internal(color);
    let red = 0;
    let green = 0;
    let blue = 0;

    if (saturation === 0) {
      red = lightness;
      green = lightness;
      blue = lightness;
    } else {
      let val;

      const t2 =
        lightness < 0.5 ?
          lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;

      const t1 = 2 * lightness - t2;
      const array = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        let t3 = hue + (1 / 3) * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }

        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        array[i] = val;
      }

      [red, green, blue] = array;
    }

    return rgb.external({ red, green, blue, alpha });
  },

  toHSL(color: PartialHSL): HSL {
    return hsl.external(hsl.internal(color));
  },

  toHSV(color: PartialHSL): HSV {
    let { hue, saturation, lightness, alpha } = hsl.internal(color);
    let sMin = saturation;
    const lMin = Math.max(lightness, 0.01);

    lightness *= 2;
    saturation *= lightness <= 1 ? lightness : 2 - lightness;
    sMin *= lMin;

    const value = (lightness + saturation) / 2;
    saturation =
      lightness === 0 ? (2 * sMin) / (lMin + sMin) : (2 * saturation) / (lightness + saturation);

    return hsv.external({ hue, saturation, value, alpha });
  },

  toHSI(color: PartialHSL): HSI {
    return rgb.toHSI(hsl.toRGB(color));
  },

  toHWB(color: PartialHSL): HWB {
    return hcg.toHWB(hsl.toHCG(color));
  },

  toHCG(color: PartialHSL): HCG {
    const { hue, saturation, lightness, alpha } = hsl.internal(color);
    const chroma =
      lightness < 0.5 ? 2.0 * saturation * lightness : 2.0 * saturation * (1.0 - lightness);

    let greyness = 0;
    if (chroma < 1.0) {
      greyness = (lightness - 0.5 * chroma) / (1.0 - chroma);
    }

    return hcg.external({ hue, chroma, greyness, alpha });
  },

  toCMY(color: PartialHSL): CMY {
    return rgb.toCMY(hsl.toRGB(color));
  },

  toCMYK(color: PartialHSL): CMYK {
    return rgb.toCMYK(hsl.toRGB(color));
  },

  toXYZ(color: PartialHSL): XYZ {
    return rgb.toXYZ(hsl.toRGB(color));
  },

  toLAB(color: PartialHSL): LAB {
    return rgb.toLAB(hsl.toRGB(color));
  },

  toLCH(color: PartialHSL): LCH {
    return lab.toLCH(hsl.toLAB(color));
  },
  parse(input: string): HSL | undefined {
    let match: RegExpMatchArray | null;
    if ((match = testHSL.exec(input))) {
      //#region HSL
      if (match[4]) {
        return hsl.toHSL({
          h: getAngle(match[1]),
          s: getPercent(match[2], 100),
          l: getPercent(match[3], 100),
          alpha: getPercent(match[4], 1),
        });
      }

      return hsl.toHSL({
        h: getAngle(match[1]),
        s: getPercent(match[2], 100),
        l: getPercent(match[3], 100),
      });
      //#endregion
    }

    return undefined;
  },

  string(input: PartialHSL, options: StringOptions): string {
    const color = hsl.external(hsl.internal(input));

    if (options.format === 'name' || options.format === 'hex') {
      return rgb.string(hsl.toRGB(color), options);
    }

    if (options.format === 'css' && options.cssVersion === 3) {
      if (color.alpha) {
        return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${round(color.alpha, 4)})`;
      }
      return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }

    if (color.alpha) {
      return `hsl(${color.h} ${color.s}% ${color.l}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `hsl(${color.h} ${color.s}% ${color.l}%)`;
  },
};
