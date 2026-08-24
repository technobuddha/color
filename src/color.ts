import { type CMY, cmy, type PartialCMY } from './cmy.ts';
import { type CMYK, cmyk, type PartialCMYK } from './cmyk.ts';
import * as colorCompare from './color-compare.ts';
import { type HCG, hcg, type PartialHCG } from './hcg.ts';
import { type HSI, hsi, type PartialHSI } from './hsi.ts';
import { type HSL, hsl, type PartialHSL } from './hsl.ts';
import { type HSV, hsv, type PartialHSV } from './hsv.ts';
import { type HWB, hwb, type PartialHWB } from './hwb.ts';
import { type LAB, lab, type PartialLAB } from './lab.ts';
import { type LCH, lch, type PartialLCH } from './lch.ts';
import { type PartialRGB, type RGB, rgb } from './rgb.ts';
import { type PartialXYZ, type XYZ, xyz } from './xyz.ts';

export type Alpha = { alpha?: number };
export type { CMY, PartialCMY as partialCMY } from './cmy.ts';
export type { CMYK, PartialCMYK as partialCMYK } from './cmyk.ts';
export type { HCG, PartialHCG as partialHCG } from './hcg.ts';
export type { HSI, PartialHSI as partialHSI } from './hsi.ts';
export type { HSL, PartialHSL as partialHSL } from './hsl.ts';
export type { HSV, PartialHSV as partialHSV } from './hsv.ts';
export type { HWB, PartialHWB as partialHWB } from './hwb.ts';
export type { LAB, PartialLAB as partialLAB } from './lab.ts';
export type { LCH, PartialLCH as partialLCH } from './lch.ts';
export type { PartialRGB as partialRGB, RGB } from './rgb.ts';
export type { PartialXYZ as partialXYZ, XYZ } from './xyz.ts';

export type Color = RGB | HSL | HSV | HSI | HWB | HCG | CMY | CMYK | XYZ | LAB | LCH;
export type PartialColor =
  | PartialRGB
  | PartialHSL
  | PartialHSV
  | PartialHSI
  | PartialHWB
  | PartialHCG
  | PartialCMY
  | PartialCMYK
  | PartialXYZ
  | PartialLAB
  | PartialLCH;
export type ColorSpecification = PartialColor | string;
export type AmountRatio = number | { ratio: number } | { amount: number };

type DispatchCall<S, T, V> = (this: void, color: S, ...args: V[]) => T;
const colorSpaceError = new TypeError('Unidentifiable color space.');

export const colorSpaces = {
  RGB: rgb,
  HSL: hsl,
  HSV: hsv,
  HSI: hsi,
  HWB: hwb,
  HCG: hcg,
  CMYK: cmyk,
  CMY: cmy,
  XYZ: xyz,
  LAB: lab,
  LCH: lch,
};

function adjust(parameter: number, ar: AmountRatio, use: 'ratio' | 'amount' = 'ratio'): number {
  return Math.min(
    Math.max(
      typeof ar === 'number' ?
        use === 'ratio' ?
          ar > 0 ?
            parameter + (1 - parameter) * ar
          : parameter + parameter * ar
        : parameter + ar
      : 'amount' in ar ? parameter + ar.amount
      : ar.ratio > 0 ? parameter + (1 - parameter) * ar.ratio
      : parameter + parameter * ar.ratio,
      0,
    ),
    1,
  );
}

function dispatch<T, V>(
  {
    rgb: rgbFn,
    hsl: hslFn,
    hsv: hsvFn,
    hsi: hsiFn,
    hwb: hwbFn,
    hcg: hcgFn,
    cmy: cmyFn,
    cmyk: cmykFn,
    xyz: xyzFn,
    lab: labFn,
    lch: lchFn,
  }: {
    rgb: DispatchCall<PartialRGB, T, V>;
    hsl: DispatchCall<PartialHSL, T, V>;
    hsv: DispatchCall<PartialHSV, T, V>;
    hsi: DispatchCall<PartialHSI, T, V>;
    hwb: DispatchCall<PartialHWB, T, V>;
    hcg: DispatchCall<PartialHCG, T, V>;
    cmy: DispatchCall<PartialCMY, T, V>;
    cmyk: DispatchCall<PartialCMYK, T, V>;
    xyz: DispatchCall<PartialXYZ, T, V>;
    lab: DispatchCall<PartialLAB, T, V>;
    lch: DispatchCall<PartialLCH, T, V>;
  },
  input: ColorSpecification,
  ...args: V[]
): T {
  const color = typeof input === 'string' ? parse(input) : input;

  if (rgb.is(color)) {
    return rgbFn(color, ...args);
  }
  if (hsl.is(color)) {
    return hslFn(color, ...args);
  }
  if (hsv.is(color)) {
    return hsvFn(color, ...args);
  }
  if (hsi.is(color)) {
    return hsiFn(color, ...args);
  }
  if (hwb.is(color)) {
    return hwbFn(color, ...args);
  }
  if (hcg.is(color)) {
    return hcgFn(color, ...args);
  }
  if (cmyk.is(color)) {
    return cmykFn(color, ...args);
  }
  if (cmy.is(color)) {
    return cmyFn(color, ...args);
  }
  if (xyz.is(color)) {
    return xyzFn(color, ...args);
  }
  if (lab.is(color)) {
    return labFn(color, ...args);
  }
  if (lch.is(color)) {
    return lchFn(color, ...args);
  }

  throw colorSpaceError;
}

export function parse(input: string): Color {
  const color =
    rgb.parse(input) ??
    hsl.parse(input) ??
    hsv.parse(input) ??
    hsi.parse(input) ??
    hwb.parse(input) ??
    hcg.parse(input) ??
    cmy.parse(input) ??
    cmyk.parse(input) ??
    xyz.parse(input) ??
    lab.parse(input) ??
    lch.parse(input);

  if (color) {
    return color;
  }

  throw new TypeError('Color can not be parsed.');
}

export type ColorFormat = 'name' | 'hex' | 'css' | 'default';
export type StringOptions = {
  format: ColorFormat;
  cssVersion: 3 | 4;
  hexShorthand: boolean;
};
export type StringFormat = ColorFormat | Partial<StringOptions>;

export const defaultStringOptions: StringOptions = {
  format: 'default',
  cssVersion: 4,
  hexShorthand: true,
};

export function getStringOptions(so?: StringFormat): StringOptions {
  if (!so) {
    return defaultStringOptions;
  }

  if (typeof so === 'string') {
    return { ...defaultStringOptions, format: so };
  }

  return {
    format: so.format ?? defaultStringOptions.format,
    cssVersion: so.cssVersion ?? defaultStringOptions.cssVersion,
    hexShorthand: so.hexShorthand ?? defaultStringOptions.hexShorthand,
  };
}

export function string(color: ColorSpecification, format?: StringFormat): ColorSpecification {
  const so = getStringOptions(format);
  return dispatch(
    {
      rgb: rgb.string,
      hsl: hsl.string,
      hsv: hsv.string,
      hsi: hsi.string,
      hwb: hwb.string,
      hcg: hcg.string,
      cmy: cmy.string,
      cmyk: cmyk.string,
      xyz: xyz.string,
      lab: lab.string,
      lch: lch.string,
    },
    color,
    so,
  );
}

export function to(color: ColorSpecification, space: keyof typeof colorSpaces): Color {
  switch (space) {
    case 'RGB': {
      return toRGB(color);
    }
    case 'HSL': {
      return toHSL(color);
    }
    case 'HSV': {
      return toHSV(color);
    }
    case 'HSI': {
      return toHSI(color);
    }
    case 'HWB': {
      return toHWB(color);
    }
    case 'HCG': {
      return toHCG(color);
    }
    case 'CMY': {
      return toCMY(color);
    }
    case 'CMYK': {
      return toCMYK(color);
    }
    case 'XYZ': {
      return toXYZ(color);
    }
    case 'LAB': {
      return toLAB(color);
    }
    case 'LCH': {
      return toLCH(color);
    }
    default: {
      throw colorSpaceError;
    }
  }
}

export function toColor(input: ColorSpecification): Color {
  const color = typeof input === 'string' ? parse(input) : input;

  if (hsl.is(color)) {
    return hsl.toHSL(color);
  }
  if (hsv.is(color)) {
    return hsv.toHSV(color);
  }
  if (hsi.is(color)) {
    return hsi.toHSI(color);
  }
  if (hwb.is(color)) {
    return hwb.toHWB(color);
  }
  if (hcg.is(color)) {
    return hcg.toHCG(color);
    // eslint-disable-next-line unicorn/no-useless-else
  } else if (cmyk.is(color)) {
    return cmyk.toCMYK(color);
  } else if (cmy.is(color)) {
    return cmy.toCMY(color);
  } else if (xyz.is(color)) {
    return xyz.toXYZ(color);
  } else if (lab.is(color)) {
    return lab.toLAB(color);
  } else if (lch.is(color)) {
    return lch.toLCH(color);
  }

  return rgb.toRGB(color);
}

export function toRGB(color: ColorSpecification): RGB {
  return dispatch(
    {
      rgb: rgb.toRGB,
      hsl: hsl.toRGB,
      hsv: hsv.toRGB,
      hsi: hsi.toRGB,
      hwb: hwb.toRGB,
      hcg: hcg.toRGB,
      cmy: cmy.toRGB,
      cmyk: cmyk.toRGB,
      xyz: xyz.toRGB,
      lab: lab.toRGB,
      lch: lch.toRGB,
    },
    color,
  );
}

export function toHSL(color: ColorSpecification): HSL {
  return dispatch(
    {
      rgb: rgb.toHSL,
      hsl: hsl.toHSL,
      hsv: hsv.toHSL,
      hsi: hsi.toHSL,
      hwb: hwb.toHSL,
      hcg: hcg.toHSL,
      cmy: cmy.toHSL,
      cmyk: cmyk.toHSL,
      xyz: xyz.toHSL,
      lab: lab.toHSL,
      lch: lch.toHSL,
    },
    color,
  );
}

export function toHSV(color: ColorSpecification): HSV {
  return dispatch(
    {
      rgb: rgb.toHSV,
      hsl: hsl.toHSV,
      hsv: hsv.toHSV,
      hsi: hsi.toHSV,
      hwb: hwb.toHSV,
      hcg: hcg.toHSV,
      cmy: cmy.toHSV,
      cmyk: cmyk.toHSV,
      xyz: xyz.toHSV,
      lab: lab.toHSV,
      lch: lch.toHSV,
    },
    color,
  );
}

export function toHSI(color: ColorSpecification): HSI {
  return dispatch(
    {
      rgb: rgb.toHSI,
      hsl: hsl.toHSI,
      hsv: hsv.toHSI,
      hsi: hsi.toHSI,
      hwb: hwb.toHSI,
      hcg: hcg.toHSI,
      cmy: cmy.toHSI,
      cmyk: cmyk.toHSI,
      xyz: xyz.toHSI,
      lab: lab.toHSI,
      lch: lch.toHSI,
    },
    color,
  );
}

export function toHWB(color: ColorSpecification): HWB {
  return dispatch(
    {
      rgb: rgb.toHWB,
      hsl: hsl.toHWB,
      hsv: hsv.toHWB,
      hsi: hsi.toHWB,
      hwb: hwb.toHWB,
      hcg: hcg.toHWB,
      cmy: cmy.toHWB,
      cmyk: cmyk.toHWB,
      xyz: xyz.toHWB,
      lab: lab.toHWB,
      lch: lch.toHWB,
    },
    color,
  );
}

export function toHCG(color: ColorSpecification): HCG {
  return dispatch(
    {
      rgb: rgb.toHCG,
      hsl: hsl.toHCG,
      hsv: hsv.toHCG,
      hsi: hsi.toHCG,
      hwb: hwb.toHCG,
      hcg: hcg.toHCG,
      cmy: cmy.toHCG,
      cmyk: cmyk.toHCG,
      xyz: xyz.toHCG,
      lab: lab.toHCG,
      lch: lch.toHCG,
    },
    color,
  );
}

export function toCMY(color: ColorSpecification): CMY {
  return dispatch(
    {
      rgb: rgb.toCMY,
      hsl: hsl.toCMY,
      hsv: hsv.toCMY,
      hsi: hsi.toCMY,
      hwb: hwb.toCMY,
      hcg: hcg.toCMY,
      cmy: cmy.toCMY,
      cmyk: cmyk.toCMY,
      xyz: xyz.toCMY,
      lab: lab.toCMY,
      lch: lch.toCMY,
    },
    color,
  );
}

export function toCMYK(color: ColorSpecification): CMYK {
  return dispatch(
    {
      rgb: rgb.toCMYK,
      hsl: hsl.toCMYK,
      hsv: hsv.toCMYK,
      hsi: hsi.toCMYK,
      hwb: hwb.toCMYK,
      hcg: hcg.toCMYK,
      cmy: cmy.toCMYK,
      cmyk: cmyk.toCMYK,
      xyz: xyz.toCMYK,
      lab: lab.toCMYK,
      lch: lch.toCMYK,
    },
    color,
  );
}

export function toXYZ(color: ColorSpecification): XYZ {
  return dispatch(
    {
      rgb: rgb.toXYZ,
      hsl: hsl.toXYZ,
      hsv: hsv.toXYZ,
      hsi: hsi.toXYZ,
      hwb: hwb.toXYZ,
      hcg: hcg.toXYZ,
      cmy: cmy.toXYZ,
      cmyk: cmyk.toXYZ,
      xyz: xyz.toXYZ,
      lab: lab.toXYZ,
      lch: lch.toXYZ,
    },
    color,
  );
}

export function toLAB(color: ColorSpecification): LAB {
  return dispatch(
    {
      rgb: rgb.toLAB,
      hsl: hsl.toLAB,
      hsv: hsv.toLAB,
      hsi: hsi.toLAB,
      hwb: hwb.toLAB,
      hcg: hcg.toLAB,
      cmy: cmy.toLAB,
      cmyk: cmyk.toLAB,
      xyz: xyz.toLAB,
      lab: lab.toLAB,
      lch: lch.toLAB,
    },
    color,
  );
}

export function toLCH(color: ColorSpecification): LCH {
  return dispatch(
    {
      rgb: rgb.toLCH,
      hsl: hsl.toLCH,
      hsv: hsv.toLCH,
      hsi: hsi.toLCH,
      hwb: hwb.toLCH,
      hcg: hcg.toLCH,
      cmy: cmy.toLCH,
      cmyk: cmyk.toLCH,
      xyz: xyz.toLCH,
      lab: lab.toLCH,
      lch: lch.toLCH,
    },
    color,
  );
}

function conform(reference: ColorSpecification): (c: Color) => Color {
  const color = typeof reference === 'string' ? parse(reference) : reference;

  if (hsl.is(color)) {
    return toHSL;
  }
  if (hsv.is(color)) {
    return toHSV;
  }
  if (hsi.is(color)) {
    return toHSI;
  }
  if (hwb.is(color)) {
    return toHWB;
  }
  if (hcg.is(color)) {
    return toHCG;
  }
  if (cmyk.is(color)) {
    return toCMYK;
  }
  if (cmy.is(color)) {
    return toCMY;
  }
  if (xyz.is(color)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return toXYZ as (c: Color) => Color;
  }
  if (lab.is(color)) {
    return toLAB;
  }
  if (lch.is(color)) {
    return toLCH;
  }

  return toRGB;
}

export function luminosity(color: ColorSpecification): number {
  let { red, green, blue } = rgb.internal(toRGB(color));

  red = red <= 0.3928 ? red / 12.92 : ((red + 0.055) / 1.055) ** 2.4;
  green = green <= 0.3928 ? green / 12.92 : ((green + 0.055) / 1.055) ** 2.4;
  blue = blue <= 0.3928 ? blue / 12.92 : ((blue + 0.055) / 1.055) ** 2.4;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrast(color1: ColorSpecification, color2: ColorSpecification): number {
  const lum1 = luminosity(color1);
  const lum2 = luminosity(color2);

  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

export function isDark(color: ColorSpecification): boolean {
  // YIQ equation from https://24ways.org/2010/calculating-color-contrast
  const { r, g, b } = toRGB(color);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}

export function isLight(color: ColorSpecification): boolean {
  return !isDark(color);
}

export function negate(color: ColorSpecification): Color {
  const { r, g, b } = toRGB(color);
  return conform(color)(toRGB({ r: 255 - r, g: 255 - g, b: 255 - b }));
}

export function hue(color: ColorSpecification, degrees = 45): Color {
  let { hue, saturation, lightness, alpha } = hsl.internal(toHSL(color));
  hue += degrees / 360;
  while (hue >= 1) {
    hue -= 1;
  }
  while (hue < 0) {
    hue += 1;
  }
  return conform(color)(hsl.external({ hue, saturation, lightness, alpha }));
}

export function saturation(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, saturation, lightness, alpha } = hsl.internal(toHSL(color));
  saturation = adjust(saturation, amount);
  return conform(color)(hsl.external({ hue, saturation, lightness, alpha }));
}

export function lightness(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, saturation, lightness, alpha } = hsl.internal(toHSL(color));
  lightness = adjust(lightness, amount);
  return conform(color)(hsl.external({ hue, saturation, lightness, alpha }));
}

export function value(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, saturation, value, alpha } = hsv.internal(toHSV(color));
  value = adjust(value, amount);
  return conform(color)(hsv.external({ hue, saturation, value, alpha }));
}

export function whiteness(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, whiteness, blackness, alpha } = hwb.internal(toHWB(color));
  whiteness = adjust(whiteness, amount);
  return conform(color)(hwb.external({ hue, whiteness, blackness, alpha }));
}

export function blackness(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, whiteness, blackness, alpha } = hwb.internal(toHWB(color));
  blackness = adjust(blackness, amount);
  return conform(color)(hwb.external({ hue, whiteness, blackness, alpha }));
}

export function chroma(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, chroma, greyness, alpha } = hcg.internal(toHCG(color));
  chroma = adjust(chroma, amount);
  return conform(color)(hcg.external({ hue, chroma, greyness, alpha }));
}

export function greyness(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, chroma, greyness, alpha } = hcg.internal(toHCG(color));
  greyness = adjust(greyness, amount);
  return conform(color)(hcg.external({ hue, chroma, greyness, alpha }));
}

export function intensity(color: ColorSpecification, amount: AmountRatio = 0.25): Color {
  let { hue, saturation, intensity, alpha } = hsi.internal(toHSI(color));
  intensity = adjust(intensity, amount);
  return conform(color)(hsi.external({ hue, saturation, intensity, alpha }));
}

export function alpha(input: ColorSpecification, amount: AmountRatio = 0.25): Color {
  const color = toColor(input);

  const alpha = adjust(color.alpha ?? 1.0, amount, 'amount');
  return conform(input)({ ...color, alpha });
}

// export function blend(color1: ColorSpecification, color2: ColorSpecification, weight = 0.5): Color {
//     let { red: red1, green: green1, blue: blue1, alpha: alpha1 } = rgb.internal(toRGB(color1));
//     let { red: red2, green: green2, blue: blue2, alpha: alpha2 } = rgb.internal(toRGB(color2));

//     var w = 2 * weight - 1;
//     var a = (alpha1 ?? 1.0) - (alpha2 ?? 1.0);

//     var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
//     var w0 = 1 - w1;

//     return conform(color1)(rgb.external({
//         red:    w0 * red1   + w1 * red2,
//         green:  w0 * green1 + w1 * green2,
//         blue:   w0 * blue1  + w1 * blue2,
//         alpha:  alpha1 === undefined && alpha2 === undefined
//             ? undefined
//             : (alpha1 ?? 1.0) * weight + (alpha2 ?? 1.0) * (1 - weight),
//     }));
// }

// export function gradient(color1: ColorSpecification, color2: ColorSpecification, steps = 100): Color[] {
//     const colors: Color[] = [];
//     const increment = (steps + 1) / (steps * 100);

//     for(let i = 0; i < steps; ++i)
//         colors.push(blend(color1, color2, i * increment));
//     return colors;
// }

const schemes = {
  complementary: [0, 180],
  splitComplementary: [0, 150, 320],
  splitComplementaryCW: [0, 150, 300],
  splitComplementaryCCW: [0, 60, 210],
  triadic: [0, 120, 240],
  clash: [0, 90, 270],
  tetradic: [0, 90, 180, 270],
  fourToneCW: [0, 60, 180, 240],
  fourToneCCW: [0, 120, 180, 300],
  fiveToneA: [0, 115, 155, 205, 245],
  fiveToneB: [0, 40, 90, 130, 245],
  fiveToneC: [0, 50, 90, 205, 320],
  fiveToneD: [0, 40, 155, 270, 310],
  fiveToneE: [0, 115, 230, 270, 320],
  sixToneCW: [0, 30, 120, 150, 240, 270],
  sixToneCCW: [0, 90, 120, 210, 240, 330],
  neutral: [0, 15, 30, 45, 60, 75],
  analogous: [0, 30, 60, 90, 120, 150],
};

export function scheme(color: ColorSpecification): Record<string, Color[]> {
  return Object.fromEntries(
    Object.entries(schemes).map(([name, angles]) => [
      name,
      angles.map((angle) => hue(color, angle)),
    ]),
  );
}

export function grayscale(color: ColorSpecification): Color {
  const { red, green, blue, alpha } = rgb.internal(toRGB(color));
  const grey = red * 0.299 + green * 0.587 + blue * 0.114;
  return conform(color)(rgb.external({ red: grey, green: grey, blue: grey, alpha }));
}

export function colorDistance(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.colorDistance(toRGB(color1), toRGB(color2));
}

export function deltaC(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.deltaC(toLAB(color1), toLAB(color2));
}

export function deltaH(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.deltaH(toLAB(color1), toLAB(color2));
}

export function deltaE1976(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.deltaE1976(toLAB(color1), toLAB(color2));
}

export function deltaE1994(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.deltaE1994(toLAB(color1), toLAB(color2));
}

export function deltaE2000(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.deltaE2000(toLAB(color1), toLAB(color2));
}

export function deltaCMC(color1: ColorSpecification, color2: ColorSpecification): number {
  return colorCompare.deltaCMC(toLAB(color1), toLAB(color2));
}

export const attributes = {
  chroma,
  saturation,
  lightness,
  value,
  whiteness,
  blackness,
  greyness,
  intensity,
};

export default {
  to,
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
  luminosity,
  contrast,
  isDark,
  isLight,
  negate,
  hue,
  attributes,
  saturation,
  lightness,
  value,
  whiteness,
  blackness,
  chroma,
  greyness,
  intensity,
  alpha,
  grayscale,
  // blend,
  // gradient,
  scheme,
  parse,
  string,
  colorDistance,
  deltaC,
  deltaH,
  deltaE1976,
  deltaE1994,
  deltaE2000,
  deltaCMC,
};
