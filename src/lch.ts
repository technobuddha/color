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
} from './color.js';
import { type ColorSpace } from './color-space.js';
import lab from './lab.js';
import rgb from './rgb.js';
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
} from './util.js';

type OLCH = { l: number; c: number; h: number };
type ILCH = { lightness: number; chroma: number; hue: number };
type InternalLCH = Alpha & ILCH;
export type PartialLCH = Alpha & (ILCH | OLCH | (ILCH & OLCH));
export type LCH = Alpha & ILCH & OLCH;

export function is(color: PartialColor): color is PartialLCH {
  return (
    ('l' in color && 'c' in color && 'h' in color) ||
    ('lightness' in color && 'chroma' in color && 'hue' in color)
  );
}

export function internal(color: PartialLCH): InternalLCH {
  if ('lightness' in color && 'chroma' in color && 'hue' in color) {
    return { lightness: color.lightness, chroma: color.chroma, hue: color.hue, alpha: color.alpha };
  }
  return {
    lightness: color.l / 100,
    chroma: color.c / 100,
    hue: color.h / 360,
    alpha: color.alpha,
  };
}

export function external({ lightness, chroma, hue, alpha }: InternalLCH): LCH {
  const obj = {
    l: round(lightness * 100, 2),
    c: round(chroma * 100, 2),
    h: round(hue * 360, 2),
    lightness,
    chroma,
    hue,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialLCH): RGB {
  return lab.toRGB(toLAB(color));
}

export function toHSL(color: PartialLCH): HSL {
  return rgb.toHSL(lab.toRGB(toLAB(color)));
}

export function toHSV(color: PartialLCH): HSV {
  return rgb.toHSV(lab.toRGB(toLAB(color)));
}

export function toHWB(color: PartialLCH): HWB {
  return rgb.toHWB(lab.toRGB(toLAB(color)));
}

export function toHSI(color: PartialLCH): HSI {
  return rgb.toHSI(toRGB(color));
}

export function toHCG(color: PartialLCH): HCG {
  return rgb.toHCG(lab.toRGB(toLAB(color)));
}

export function toCMY(color: PartialLCH): CMY {
  return rgb.toCMY(toRGB(color));
}

export function toCMYK(color: PartialLCH): CMYK {
  return rgb.toCMYK(lab.toRGB(toLAB(color)));
}

export function toXYZ(color: PartialLCH): XYZ {
  return lab.toXYZ(toLAB(color));
}

export function toLAB(color: PartialLCH): LAB {
  const { lightness, chroma, hue, alpha } = internal(color);

  const hr = hue * (2 * Math.PI);
  const redGreen = chroma * Math.cos(hr);
  const blueYellow = chroma * Math.sin(hr);

  return lab.external({ lightness, redGreen, blueYellow, alpha });
}

export function toLCH(color: PartialLCH): LCH {
  return external(internal(color));
}

export function parse(input: string): LCH | undefined {
  const reRGB = re`^lch${reOp}${rePercent}${reSep}${reNumber}${reSep}${reAngle}${reAlpha}${reCp}$`;

  let match: RegExpMatchArray | null;

  if ((match = reRGB.exec(input))) {
    //#region RGB
    if (match[4]) {
      return toLCH({
        l: getPercent(match[1], 100),
        c: getNumber(match[2]),
        h: getAngle(match[3]),
        alpha: getPercent(match[4], 1),
      });
    }

    return toLCH({
      l: getPercent(match[1], 100),
      c: getNumber(match[2]),
      h: getAngle(match[3]),
    });
    //#endregion
  }

  return undefined;
}

export function string(input: PartialLCH, options: StringOptions): string {
  const color = external(internal(input));

  if (
    options.format === 'name' ||
    options.format === 'hex' ||
    (options.format === 'css' && options.cssVersion === 3)
  ) {
    return rgb.string(toRGB(color), options);
  }

  if (color.alpha) {
    return `lch(${color.l}% ${color.c} ${color.h} / ${round(color.alpha * 100, 2)}%)`;
  }
  return `lch(${color.l}% ${color.c} ${color.h})`;
}

const lch: ColorSpace<LCH, PartialLCH, InternalLCH> = {
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

export default lch;
