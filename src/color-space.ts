import {
  type CMY,
  type CMYK,
  type Color,
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

export type ColorSpace<Space extends Color, Partial extends PartialColor, Internal> = {
  is(this: void, color: PartialColor): color is Partial;
  internal(this: void, color: Partial): Internal;
  external(this: void, color: Internal): Space;
  toRGB(this: void, color: Partial): RGB;
  toHSL(this: void, color: Partial): HSL;
  toHSV(this: void, color: Partial): HSV;
  toHSI(this: void, color: Partial): HSI;
  toHWB(this: void, color: Partial): HWB;
  toHCG(this: void, color: Partial): HCG;
  toCMY(this: void, color: Partial): CMY;
  toCMYK(this: void, color: Partial): CMYK;
  toXYZ(this: void, color: Partial): XYZ;
  toLAB(this: void, color: Partial): LAB;
  toLCH(this: void, color: Partial): LCH;
  parse(this: void, input: string): Space | undefined;
  string(this: void, color: Partial, options: StringOptions): string;
};
