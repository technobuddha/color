/* eslint-disable no-bitwise */
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
} from './color.js';
import { type ColorSpace } from './color-space.js';
import hcg from './hcg.js';
import lab from './lab.js';
import rgb from './rgb.js';
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
} from './util.js';

type OHWB = { h: number; w: number; b: number };
type IHWB = { hue: number; whiteness: number; blackness: number };
type InternalHWB = Alpha & IHWB;
export type PartialHWB = Alpha & (IHWB | OHWB | (IHWB & OHWB));
export type HWB = Alpha & IHWB & OHWB;

export function is(color: PartialColor): color is PartialHWB {
  return (
    ('h' in color && 'w' in color && 'b' in color) ||
    ('hue' in color && 'whiteness' in color && 'blackness' in color)
  );
}

export function internal(color: PartialHWB): InternalHWB {
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
}

export function external({ hue, whiteness, blackness, alpha }: InternalHWB): HWB {
  const obj = {
    h: round(hue * 360, 2),
    w: round(whiteness * 100, 2),
    b: round(blackness * 100, 2),
    hue,
    whiteness,
    blackness,
  };

  return alpha === undefined ? obj : { ...obj, alpha };
}

export function toRGB(color: PartialHWB): RGB {
  let { hue, whiteness, blackness, alpha } = internal(color);
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
}

export function toHSL(color: PartialHWB): HSL {
  return rgb.toHSL(toRGB(color));
}

export function toHSV(color: PartialHWB): HSV {
  return rgb.toHSV(toRGB(color));
}

export function toHSI(color: PartialHWB): HSI {
  return rgb.toHSI(toRGB(color));
}

export function toHWB(color: PartialHWB): HWB {
  return external(internal(color));
}

export function toHCG(color: PartialHWB): HCG {
  const { hue, whiteness, blackness, alpha } = internal(color);
  const v = 1 - blackness;
  const chroma = v - whiteness;
  let greyness = 0;

  if (chroma < 1) {
    greyness = (v - chroma) / (1 - chroma);
  }

  return hcg.external({ hue, chroma, greyness, alpha });
}

export function toCMY(color: PartialHWB): CMY {
  return rgb.toCMY(toRGB(color));
}

export function toCMYK(color: PartialHWB): CMYK {
  return rgb.toCMYK(toRGB(color));
}

export function toXYZ(color: PartialHWB): XYZ {
  return rgb.toXYZ(toRGB(color));
}

export function toLAB(color: PartialHWB): LAB {
  return rgb.toLAB(toRGB(color));
}

export function toLCH(color: PartialHWB): LCH {
  return lab.toLCH(toLAB(color));
}

export function parse(input: string): HWB | undefined {
  const reRGB = re`^hwb${reOp}${reAngle}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

  let match: RegExpMatchArray | null;
  if ((match = reRGB.exec(input))) {
    //#region RGB
    if (match[4]) {
      return toHWB({
        h: getAngle(match[1]),
        w: getPercent(match[2], 100),
        b: getPercent(match[3], 100),
        alpha: getPercent(match[4], 1),
      });
    }

    return toHWB({
      h: getAngle(match[1]),
      w: getPercent(match[2], 100),
      b: getPercent(match[3], 100),
    });
    //#endregion
  }

  return undefined;
}

export function string(input: PartialHWB, options: StringOptions): string {
  const color = external(internal(input));

  if (
    options.format === 'name' ||
    options.format === 'hex' ||
    (options.format === 'css' && options.cssVersion === 3)
  ) {
    return rgb.string(toRGB(color), options);
  }

  if (color.alpha) {
    return `hwb(${color.h} ${color.w}% ${color.b}% / ${round(color.alpha * 100, 2)}%)`;
  }
  return `hwb(${color.h} ${color.w}% ${color.b}%)`;
}

const hwb: ColorSpace<HWB, PartialHWB, InternalHWB> = {
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

export default hwb;
