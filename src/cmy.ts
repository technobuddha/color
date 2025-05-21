import cmyk from './cmyk.js';
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
} from './color.js';
import { type ColorSpace } from './color-space.js';
import rgb from './rgb.js';
import { approxEq, getPercent, re, reAlpha, reCp, reOp, rePercent, reSep, round } from './util.js';

type OCMY = { c: number; m: number; y: number };
type ICMY = { cyan: number; magenta: number; yellow: number };
type InternalCMY = Alpha & ICMY;
export type PartialCMY = Alpha & (ICMY | OCMY | (ICMY & OCMY));
export type CMY = Alpha & ICMY & OCMY;

export function is(color: PartialColor): color is PartialCMY {
  return (
    ('c' in color && 'm' in color && 'y' in color) ||
    ('cyan' in color && 'magenta' in color && 'yellow' in color)
  );
}

export function internal(color: PartialCMY): InternalCMY {
  if ('cyan' in color && 'magenta' in color && 'yellow' in color) {
    return { cyan: color.cyan, magenta: color.magenta, yellow: color.yellow, alpha: color.alpha };
  }
  return { cyan: color.c / 100, magenta: color.m / 100, yellow: color.y / 100, alpha: color.alpha };
}

export function external({ cyan, magenta, yellow, alpha }: InternalCMY): CMY {
  const obj = {
    c: round(cyan * 100, 2),
    m: round(magenta * 100, 2),
    y: round(yellow * 100, 2),
    cyan,
    magenta,
    yellow,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialCMY): RGB {
  const { cyan, magenta, yellow, alpha } = internal(color);
  return rgb.external({ red: 1 - cyan, green: 1 - magenta, blue: 1 - yellow, alpha });
}

export function toHSL(color: PartialCMY): HSL {
  return rgb.toHSL(toRGB(color));
}

export function toHSV(color: PartialCMY): HSV {
  return rgb.toHSV(toRGB(color));
}

export function toHSI(color: PartialCMY): HSI {
  return rgb.toHSI(toRGB(color));
}

export function toHWB(color: PartialCMY): HWB {
  return rgb.toHWB(toRGB(color));
}

export function toHCG(color: PartialCMY): HCG {
  return rgb.toHCG(toRGB(color));
}

export function toCMY(color: PartialCMY): CMY {
  return external(internal(color));
}

export function toCMYK(color: PartialCMY): CMYK {
  let { cyan, magenta, yellow, alpha } = internal(color);
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
}

export function toXYZ(color: PartialCMY): XYZ {
  return rgb.toXYZ(toRGB(color));
}

export function toLAB(color: PartialCMY): LAB {
  return rgb.toLAB(toRGB(color));
}

export function toLCH(color: PartialCMY): LCH {
  return rgb.toLCH(toRGB(color));
}

export function parse(input: string): CMY | undefined {
  const testCMY = re`^cmy${reOp}${rePercent}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

  let match: RegExpMatchArray | null;

  if ((match = testCMY.exec(input))) {
    if (match[4]) {
      return toCMY({
        c: getPercent(match[1], 100),
        m: getPercent(match[2], 100),
        y: getPercent(match[3], 100),
        alpha: getPercent(match[4], 1),
      });
    }

    return toCMY({
      c: getPercent(match[1], 100),
      m: getPercent(match[2], 100),
      y: getPercent(match[3], 100),
    });
  }

  return undefined;
}

export function string(input: PartialCMY, options: StringOptions): string {
  const color = external(internal(input));

  if (options.format === 'name' || options.format === 'hex' || options.format === 'css') {
    return rgb.string(toRGB(color), options);
  }

  if (color.alpha) {
    return `cmy(${color.c}% ${color.m}% ${color.y}% / ${round(color.alpha * 100, 2)}%)`;
  }
  return `cmy(${color.c}% ${color.m}% ${color.y}%)`;
}

const cmy: ColorSpace<CMY, PartialCMY, InternalCMY> = {
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

export default cmy;
