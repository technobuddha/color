import { cmyk } from './cmyk.ts';
import {
  type Alpha,
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
  type XYZ,
} from './color.ts';
import { type ColorSpace } from './color-space.ts';
import { rgb } from './rgb.ts';
import { approxEq, getPercent, re, reAlpha, reCp, reOp, rePercent, reSep, round } from './util.ts';

type OCMY = { c: number; m: number; y: number };
type ICMY = { cyan: number; magenta: number; yellow: number };
type InternalCMY = Alpha & ICMY;

export type PartialCMY = Alpha & (ICMY | OCMY | (ICMY & OCMY));
export type CMY = Alpha & ICMY & OCMY;

export const cmy: ColorSpace<CMY, PartialCMY, InternalCMY> = {
  is(color: PartialColor): color is PartialCMY {
    return (
      ('c' in color && 'm' in color && 'y' in color) ||
      ('cyan' in color && 'magenta' in color && 'yellow' in color)
    );
  },

  internal(color: PartialCMY): InternalCMY {
    if ('cyan' in color && 'magenta' in color && 'yellow' in color) {
      return { cyan: color.cyan, magenta: color.magenta, yellow: color.yellow, alpha: color.alpha };
    }
    return {
      cyan: color.c / 100,
      magenta: color.m / 100,
      yellow: color.y / 100,
      alpha: color.alpha,
    };
  },

  external({ cyan, magenta, yellow, alpha }: InternalCMY): CMY {
    const obj = {
      c: round(cyan * 100, 2),
      m: round(magenta * 100, 2),
      y: round(yellow * 100, 2),
      cyan,
      magenta,
      yellow,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialCMY): RGB {
    const { cyan, magenta, yellow, alpha } = cmy.internal(color);
    return rgb.external({ red: 1 - cyan, green: 1 - magenta, blue: 1 - yellow, alpha });
  },

  toHSL(color: PartialCMY): HSL {
    return rgb.toHSL(cmy.toRGB(color));
  },

  toHSV(color: PartialCMY): HSV {
    return rgb.toHSV(cmy.toRGB(color));
  },

  toHSI(color: PartialCMY): HSI {
    return rgb.toHSI(cmy.toRGB(color));
  },

  toHWB(color: PartialCMY): HWB {
    return rgb.toHWB(cmy.toRGB(color));
  },

  toHCG(color: PartialCMY): HCG {
    return rgb.toHCG(cmy.toRGB(color));
  },

  toCMY(color: PartialCMY): CMY {
    return cmy.external(cmy.internal(color));
  },

  toCMYK(color: PartialCMY): CMYK {
    let { cyan, magenta, yellow, alpha } = cmy.internal(color);
    let black = 1.0;

    if (cyan < black) {
      black = cyan;
    }
    if (magenta < black) {
      black = magenta;
    }
    if (yellow < black) {
      black = yellow;
    }
    if (approxEq(black, 1)) {
      cyan = 0;
      magenta = 0;
      yellow = 0;
    } else {
      cyan = (cyan - black) / (1 - black);
      magenta = (magenta - black) / (1 - black);
      yellow = (yellow - black) / (1 - black);
    }

    return cmyk.external({ cyan, magenta, yellow, black, alpha });
  },

  toXYZ(color: PartialCMY): XYZ {
    return rgb.toXYZ(cmy.toRGB(color));
  },

  toLAB(color: PartialCMY): LAB {
    return rgb.toLAB(cmy.toRGB(color));
  },

  toLCH(color: PartialCMY): LCH {
    return rgb.toLCH(cmy.toRGB(color));
  },

  parse(input: string): CMY | undefined {
    const testCMY = re`^cmy${reOp}${rePercent}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

    let match: RegExpMatchArray | null;

    if ((match = testCMY.exec(input))) {
      if (match[4]) {
        return cmy.toCMY({
          c: getPercent(match[1], 100),
          m: getPercent(match[2], 100),
          y: getPercent(match[3], 100),
          alpha: getPercent(match[4], 1),
        });
      }

      return cmy.toCMY({
        c: getPercent(match[1], 100),
        m: getPercent(match[2], 100),
        y: getPercent(match[3], 100),
      });
    }

    return undefined;
  },

  string(input: PartialCMY, options: StringOptions): string {
    const color = cmy.external(cmy.internal(input));

    if (options.format === 'name' || options.format === 'hex' || options.format === 'css') {
      return rgb.string(cmy.toRGB(color), options);
    }

    if (color.alpha) {
      return `cmy(${color.c}% ${color.m}% ${color.y}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `cmy(${color.c}% ${color.m}% ${color.y}%)`;
  },
};
