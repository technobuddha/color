import cmy from './cmy.js';
import {
  type Alpha,
  type CMY,
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
} from './color.js';
import { type ColorSpace } from './color-space.js';
import rgb from './rgb.js';
import { getPercent, re, reAlpha, reCp, reOp, rePercent, reSep, round } from './util.js';

type OCYMK = { c: number; m: number; y: number; k: number };
type ICYMK = { cyan: number; magenta: number; yellow: number; black: number };
type InternalCMYK = Alpha & ICYMK;
export type PartialCMYK = Alpha & (ICYMK | OCYMK | (ICYMK & OCYMK));
export type CMYK = Alpha & ICYMK & OCYMK;

export function is(color: PartialColor): color is PartialCMYK {
  return (
    ('c' in color && 'm' in color && 'y' in color && 'k' in color) ||
    ('cyan' in color && 'magenta' in color && 'yellow' in color && 'black' in color)
  );
}

export function internal(color: PartialCMYK): InternalCMYK {
  if ('cyan' in color && 'magenta' in color && 'yellow' in color && 'black' in color) {
    return {
      cyan: color.cyan,
      magenta: color.magenta,
      yellow: color.yellow,
      black: color.black,
      alpha: color.alpha,
    };
  }
  return {
    cyan: color.c / 100,
    magenta: color.m / 100,
    yellow: color.y / 100,
    black: color.k / 100,
    alpha: color.alpha,
  };
}

export function external({ cyan, magenta, yellow, black, alpha }: InternalCMYK): CMYK {
  const obj = {
    c: round(cyan * 100, 2),
    m: round(magenta * 100, 2),
    y: round(yellow * 100, 2),
    k: round(black * 100, 2),
    cyan,
    magenta,
    yellow,
    black,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialCMYK): RGB {
  const { cyan, magenta, yellow, black, alpha } = internal(color);

  const red = 1 - Math.min(1, cyan * (1 - black) + black);
  const green = 1 - Math.min(1, magenta * (1 - black) + black);
  const blue = 1 - Math.min(1, yellow * (1 - black) + black);

  return rgb.external({ red, green, blue, alpha });
}

export function toHSL(color: PartialCMYK): HSL {
  return rgb.toHSL(toRGB(color));
}

export function toHSV(color: PartialCMYK): HSV {
  return rgb.toHSV(toRGB(color));
}

export function toHSI(color: PartialCMYK): HSI {
  return rgb.toHSI(toRGB(color));
}

export function toHWB(color: PartialCMYK): HWB {
  return rgb.toHWB(toRGB(color));
}

export function toHCG(color: PartialCMYK): HCG {
  return rgb.toHCG(toRGB(color));
}

export function toCMY(color: PartialCMYK): CMY {
  let { cyan, magenta, yellow, black, alpha } = internal(color);

  cyan = cyan * (1 - black) + black;
  magenta = magenta * (1 - black) + black;
  yellow = yellow * (1 - black) + black;

  return cmy.external({ cyan, magenta, yellow, alpha });
}

export function toCMYK(color: PartialCMYK): CMYK {
  return external(internal(color));
}

export function toXYZ(color: PartialCMYK): XYZ {
  return rgb.toXYZ(toRGB(color));
}

export function toLAB(color: PartialCMYK): LAB {
  return rgb.toLAB(toRGB(color));
}

export function toLCH(color: PartialCMYK): LCH {
  return rgb.toLCH(toRGB(color));
}
export function parse(input: string): CMYK | undefined {
  const reRGB = re`^(?:device-)?cmyk${reOp}${rePercent}${reSep}${rePercent}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

  let match: RegExpMatchArray | null;

  if ((match = reRGB.exec(input))) {
    if (match[5]) {
      return toCMYK({
        c: getPercent(match[1], 100),
        m: getPercent(match[2], 100),
        y: getPercent(match[3], 100),
        k: getPercent(match[4], 100),
        alpha: getPercent(match[5], 1),
      });
    }

    return toCMYK({
      c: getPercent(match[1], 100),
      m: getPercent(match[2], 100),
      y: getPercent(match[3], 100),
      k: getPercent(match[4], 100),
    });
  }

  return undefined;
}

export function string(input: PartialCMYK, options: StringOptions): string {
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
      return `device-cmyk(${color.c}% ${color.m}% ${color.y}% ${color.k}% / ${round(color.alpha * 100, 2)}%)`;
    }
    return `device-cmyk(${color.c}% ${color.m}% ${color.y}% ${color.k}%)`;
  }

  if (color.alpha) {
    return `cmyk(${color.c}% ${color.m}% ${color.y}% ${color.k}% / ${round(color.alpha * 100, 2)}%)`;
  }
  return `cmyk(${color.c}% ${color.m}% ${color.y}% ${color.k}%)`;
}

export const cmyk: ColorSpace<CMYK, PartialCMYK, InternalCMYK> = {
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

export default cmyk;
