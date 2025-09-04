/* eslint-disable no-bitwise */
import { cmy } from './cmy.ts';
import { cmyk } from './cmyk.ts';
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
  type LCH,
  type PartialColor,
  type StringOptions,
  type XYZ,
} from './color.ts';
import { findColor, findName } from './color-names.ts';
import { type ColorSpace } from './color-space.ts';
import { hcg } from './hcg.ts';
import { hsi } from './hsi.ts';
import { hsl } from './hsl.ts';
import { hsv } from './hsv.ts';
import { hwb } from './hwb.ts';
import { lab } from './lab.ts';
import { approxEq, getPercent, re, reAlpha, reCp, reOp, rePercent, reSep, round } from './util.ts';
import { xyz } from './xyz.ts';

export type ORGB = { r: number; g: number; b: number };
type IRGB = { red: number; green: number; blue: number };
type InternalRGB = Alpha & IRGB;
export type PartialRGB = Alpha & (IRGB | ORGB | (IRGB & ORGB));
export type RGB = Alpha & IRGB & ORGB;

const testHEX = /^#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/iu;
const testRGB = re`^rgba?${reOp}${rePercent}${reSep}${rePercent}${reSep}${rePercent}${reAlpha}${reCp}$`;

function attributes(color: PartialRGB): {
  chroma: number;
  hue: number;
  hslSaturation: number;
  hsvSaturation: number;
  hsiSaturation: number;
  lightness: number;
  value: number;
  whiteness: number;
  blackness: number;
  greyness: number;
  intensity: number;
  alpha: number | undefined;
} {
  const { red, green, blue, alpha } = rgb.internal(color);
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
  const chroma = max - min;
  let hue = 0;
  let hslSaturation = 0;
  let hsvSaturation = 0;
  let hsiSaturation = 0;
  const lightness = (max + min) / 2;
  const value = max;
  const whiteness = min;
  const blackness = 1 - max;
  const greyness = approxEq(chroma, 1) ? 0 : min / (1 - chroma);
  const intensity = (red + green + blue) / 3;

  if (!approxEq(chroma, 0)) {
    const deltaR = (max - red) / 6 / chroma;
    const deltaG = (max - green) / 6 / chroma;
    const deltaB = (max - blue) / 6 / chroma;

    if (approxEq(red, max)) {
      hue = 0 / 3 + deltaB - deltaG;
    } else if (approxEq(green, max)) {
      hue = 1 / 3 + deltaR - deltaB;
    } else {
      hue = 2 / 3 + deltaG - deltaR;
    }

    if (hue < 0) {
      hue += 1;
    }

    hslSaturation = lightness <= 0.5 ? chroma / (max + min) : chroma / (2 - max - min);
  }

  if (!approxEq(max, 0)) {
    hsvSaturation = chroma / max;
  }

  if (!approxEq(intensity, 0)) {
    hsiSaturation = 1 - min / intensity;
  }

  return {
    chroma,
    hue,
    hslSaturation,
    hsvSaturation,
    hsiSaturation,
    lightness,
    value,
    whiteness,
    blackness,
    greyness,
    intensity,
    alpha,
  };
}

export const rgb: ColorSpace<RGB, PartialRGB, InternalRGB> = {
  is(color: PartialColor): color is PartialRGB {
    return (
      ('r' in color && 'r' in color && 'b' in color) ||
      ('red' in color && 'green' in color && 'blue' in color)
    );
  },

  internal(color: PartialRGB): InternalRGB {
    if ('red' in color && 'green' in color && 'blue' in color) {
      return { red: color.red, green: color.green, blue: color.blue, alpha: color.alpha };
    }
    return { red: color.r / 255, green: color.g / 255, blue: color.b / 255, alpha: color.alpha };
  },

  external({ red, green, blue, alpha }: InternalRGB): RGB {
    const obj = {
      r: round(red * 255, 2),
      g: round(green * 255, 2),
      b: round(blue * 255, 2),
      red,
      green,
      blue,
    };

    return alpha === undefined ? obj : { ...obj, alpha };
  },

  toRGB(color: PartialRGB): RGB {
    return rgb.external(rgb.internal(color));
  },

  toHSL(color: PartialRGB): HSL {
    const { hue, hslSaturation: saturation, lightness, alpha } = attributes(color);
    return hsl.external({ hue, saturation, lightness, alpha });
  },

  toHSV(color: PartialRGB): HSV {
    const { hue, hsvSaturation: saturation, value, alpha } = attributes(color);
    return hsv.external({ hue, saturation, value, alpha });
  },

  toHSI(color: PartialRGB): HSI {
    const { hue, hsiSaturation: saturation, intensity, alpha } = attributes(color);
    return hsi.external({ hue, saturation, intensity, alpha });
  },

  toHWB(color: PartialRGB): HWB {
    const { hue, whiteness, blackness, alpha } = attributes(color);
    return hwb.external({ hue, whiteness, blackness, alpha });
  },

  toHCG(color: PartialRGB): HCG {
    const { hue, chroma, greyness, alpha } = attributes(color);
    return hcg.external({ hue, chroma, greyness, alpha });
  },

  toCMY(color: PartialRGB): CMY {
    const { red, green, blue, alpha } = rgb.internal(color);
    return cmy.external({ cyan: 1 - red, magenta: 1 - green, yellow: 1 - blue, alpha });
  },

  toCMYK(color: PartialRGB): CMYK {
    const { red, green, blue, alpha } = rgb.internal(color);
    const black = Math.min(1 - red, 1 - green, 1 - blue);
    const cyan = (1 - red - black) / (1 - black) || 0;
    const magenta = (1 - green - black) / (1 - black) || 0;
    const yellow = (1 - blue - black) / (1 - black) || 0;

    return cmyk.external({ cyan, magenta, yellow, black, alpha });
  },

  toXYZ(color: PartialRGB): XYZ {
    //X, Y and Z output refer to a D65/2° standard illuminant.
    let { red, green, blue, alpha } = rgb.internal(color);

    // Assume sRGB
    red = red > 0.04045 ? ((red + 0.055) / 1.055) ** 2.4 : red / 12.92;
    green = green > 0.04045 ? ((green + 0.055) / 1.055) ** 2.4 : green / 12.92;
    blue = blue > 0.04045 ? ((blue + 0.055) / 1.055) ** 2.4 : blue / 12.92;

    const X = red * 0.4124564 + green * 0.3575761 + blue * 0.1804375;
    const Y = red * 0.2126729 + green * 0.7151522 + blue * 0.072175;
    const Z = red * 0.0193339 + green * 0.119192 + blue * 0.9503041;

    return xyz.external({ X, Y, Z, alpha });
  },

  toLAB(color: PartialRGB): LAB {
    return xyz.toLAB(rgb.toXYZ(color));
  },

  toLCH(color: PartialRGB): LCH {
    return lab.toLCH(rgb.toLAB(color));
  },

  parse(input: string): RGB | undefined {
    let match: RegExpMatchArray | null;
    if (testHEX.test(input)) {
      //#region HEX
      const n = Number.parseInt(input.slice(1), 16);

      switch (input.length - 1) {
        case 3: {
          return rgb.toRGB({
            r: ((n >> 8) & 0x0f) | ((n >> 4) & 0xf0),
            g: ((n >> 4) & 0x0f) | (n & 0xf0),
            b: (n & 0x0f) | ((n << 4) & 0xf0),
          });
        }

        case 4: {
          return rgb.toRGB({
            r: ((n >> 12) & 0x0f) | ((n >> 8) & 0xf0),
            g: ((n >> 8) & 0x0f) | ((n >> 4) & 0xf0),
            b: ((n >> 4) & 0x0f) | (n & 0xf0),
            alpha: ((n & 0x0f) | ((n << 4) & 0xf0)) / 255,
          });
        }

        case 6: {
          return rgb.toRGB({
            r: (n >> 16) & 0xff,
            g: (n >> 8) & 0xff,
            b: n & 0xff,
          });
        }

        case 8: {
          return rgb.toRGB({
            r: (n >> 24) & 0xff,
            g: (n >> 16) & 0xff,
            b: (n >> 8) & 0xff,
            alpha: (n & 0xff) / 255,
          });
        }

        // no default
      }
      //#endregion
    } else if ((match = testRGB.exec(input))) {
      //#region RGB
      if (match[4]) {
        return rgb.toRGB({
          r: getPercent(match[1], 255),
          g: getPercent(match[2], 255),
          b: getPercent(match[3], 255),
          alpha: getPercent(match[4], 1),
        });
      }

      return rgb.toRGB({
        r: getPercent(match[1], 255),
        g: getPercent(match[2], 255),
        b: getPercent(match[3], 255),
      });
      //#endregion
    }

    return findColor(input);
  },

  string(input: PartialRGB, options: StringOptions): string {
    const color = rgb.external(rgb.internal(input));

    if (options.format === 'name') {
      const name = findName(color);
      if (name) {
        return name;
      }
    }

    if (options.format === 'hex') {
      const rHex = round(color.r, 0).toString(16).padStart(2, '0');
      const gHex = round(color.g, 0).toString(16).padStart(2, '0');
      const bHex = round(color.b, 0).toString(16).padStart(2, '0');

      if (input.alpha === undefined) {
        if (
          options.hexShorthand &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          rHex[0] === rHex[1] &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          gHex[0] === gHex[1] &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          bHex[0] === bHex[1]
        ) {
          return `#${rHex[0]}${gHex[0]}${bHex[0]}`;
        }
        return `#${rHex}${gHex}${bHex}`;
      } else if (options.cssVersion === 4) {
        const aHex = Math.round(input.alpha * 255)
          .toString(16)
          .padStart(2, '0');

        if (
          options.hexShorthand &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          rHex[0] === rHex[1] &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          gHex[0] === gHex[1] &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          bHex[0] === bHex[1] &&
          // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
          aHex[0] === aHex[1]
        ) {
          return `#${rHex[0]}${gHex[0]}${bHex[0]}${aHex[0]}`;
        }
        return `#${rHex}${gHex}${bHex}${aHex}`;
      }
    }

    if (options.format !== 'default' && options.cssVersion === 3) {
      if (color.alpha === undefined) {
        return `rgb(${round(color.r, 0)}, ${round(color.g, 0)}, ${round(color.b, 0)})`;
      }
      return `rgba(${round(color.r, 0)}, ${round(color.g, 0)}, ${round(color.b, 0)}, ${round(color.alpha, 4)})`;
    }

    if (color.alpha) {
      return `rgb(${color.r} ${color.g} ${color.b} / ${round(color.alpha * 100, 2)}%)`;
    }
    return `rgb(${color.r} ${color.g} ${color.b})`;
  },
};
