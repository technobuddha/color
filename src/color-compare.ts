/* eslint-disable @typescript-eslint/naming-convention */
import { type LAB, type RGB } from './color.ts';
import { lab } from './lab.ts';
import { lch } from './lch.ts';
import { toDegrees, toRadians } from './util.ts';

export function colorDistance(color: RGB, other: RGB): number {
  const rMean = (255 * (color.red + other.red)) / 2;
  const r = 255 * (color.red - other.red);
  const g = 255 * (color.green - other.green);
  const b = 255 * (color.blue - other.blue);
  return Math.sqrt((2 + rMean / 256) * r * r + 4 * g * g + (2 + (255 - rMean) / 256) * b * b);
}

function getH(x: number, y: number): number {
  if (x === 0 && y === 0) {
    return 0;
  }

  const hue = toDegrees(Math.atan2(x, y));
  if (hue >= 0) {
    return hue;
  }
  return hue + 360;
}

export function deltaC(color1: LAB, color2: LAB): number {
  const { redGreen: redGreen1, blueYellow: blueYellow1 } = lab.internal(color1);
  const { redGreen: redGreen2, blueYellow: blueYellow2 } = lab.internal(color2);

  return (
    Math.hypot(redGreen2 * 100, blueYellow2 * 100) - Math.hypot(redGreen1 * 100, blueYellow1 * 100)
  );
}

export function deltaH(color1: LAB, color2: LAB): number {
  const { redGreen: redGreen1, blueYellow: blueYellow1 } = lab.internal(color1);
  const { redGreen: redGreen2, blueYellow: blueYellow2 } = lab.internal(color2);

  return Math.sqrt(
    (redGreen2 * 100 - redGreen1 * 100) ** 2 +
      (blueYellow2 * 100 - blueYellow1 * 100) ** 2 -
      deltaC(color1, color2) ** 2,
  );
}

export function deltaE1976(color1: LAB, color2: LAB): number {
  const {
    lightness: lightness1,
    redGreen: redGreen1,
    blueYellow: blueYellow1,
  } = lab.internal(color1);
  const {
    lightness: lightness2,
    redGreen: redGreen2,
    blueYellow: blueYellow2,
  } = lab.internal(color2);
  return Math.hypot(
    lightness1 * 100 - lightness2 * 100,
    redGreen1 * 100 - redGreen2 * 100,
    blueYellow1 * 100 - blueYellow2 * 100,
  );
}

export function deltaE1994(color1: LAB, color2: LAB): number {
  let { lightness: l1, redGreen: a1, blueYellow: b1 } = lab.internal(color1);
  let { lightness: l2, redGreen: a2, blueYellow: b2 } = lab.internal(color2);

  // We use the internal values because they are more precise, but the formula is based on external
  l1 *= 100;
  a1 *= 100;
  b1 *= 100;
  l2 *= 100;
  a2 *= 100;
  b2 *= 100;

  const Kl = 1.0; // Weighing factors
  const Kc = 1.0;
  const Kh = 1.0;

  const K1 = 0.045; //0.048
  const K2 = 0.015; //0.014

  const ΔL = l1 - l2;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const ΔC = C1 - C2;
  const ΔE = deltaE1976(color1, color2);
  let ΔH = ΔE ** 2 - ΔL ** 2 - ΔC ** 2;
  ΔH = ΔH > 0 ? Math.sqrt(ΔH) : 0;
  const Sl = 1.0;
  const Sc = 1 + K1 * C1;
  const Sh = 1 + K2 * C1;

  return Math.hypot(ΔL / (Kl * Sl), ΔC / (Kc * Sc), ΔH / (Kh * Sh));
}

export function deltaE2000(color1: LAB, color2: LAB): number {
  let { lightness: l1, redGreen: a1, blueYellow: b1 } = lab.internal(color1);
  let { lightness: l2, redGreen: a2, blueYellow: b2 } = lab.internal(color2);

  // We use the internal values because they are more precise, but the formula is based on external
  l1 *= 100;
  a1 *= 100;
  b1 *= 100;
  l2 *= 100;
  a2 *= 100;
  b2 *= 100;

  const Kl = 1.0;
  const Kc = 1.0;
  const Kh = 1.0;

  const ΔĹ = l2 - l1;

  const Ĺ̅ = (l1 + l2) / 2;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const C̅ = (C1 + C2) / 2;

  const á1 = a1 + (a1 / 2) * (1 - Math.sqrt(C̅ ** 7 / (C̅ ** 7 + 25 ** 7)));
  const á2 = a2 + (a2 / 2) * (1 - Math.sqrt(C̅ ** 7 / (C̅ ** 7 + 25 ** 7)));
  const Ć1 = Math.hypot(á1, b1);
  const Ć2 = Math.hypot(á2, b2);
  const Ć̅ = (Ć1 + Ć2) / 2;
  const ΔĆ = Ć2 - Ć1;

  const h́1 = getH(b1, á1);
  const h́2 = getH(b2, á2);

  const Δh́ =
    C1 === 0 || C2 === 0 ? 0
    : Math.abs(h́1 - h́2) <= 180 ? h́2 - h́1
    : h́2 <= h́1 ? h́2 - h́1 + 360
    : h́2 - h́1 - 360;

  const ΔH́ = 2 * Math.sqrt(Ć1 * Ć2) * Math.sin(toRadians(Δh́ / 2));

  const H́̅ =
    Math.abs(h́1 - h́2) <= 180 ? (h́1 + h́2) / 2
    : h́1 + h́2 < 360 ? (h́1 + h́2 + 360) / 2
    : (h́1 + h́2 - 360) / 2;

  const T =
    1 -
    0.17 * Math.cos(toRadians(H́̅ - 30)) +
    0.24 * Math.cos(toRadians(2 * H́̅)) +
    0.32 * Math.cos(toRadians(3 * H́̅ + 6)) -
    0.2 * Math.cos(toRadians(4 * H́̅ - 63));

  const Sl = 1 + (0.015 * (Ĺ̅ - 50) ** 2) / Math.sqrt(20 + (Ĺ̅ - 50) ** 2);
  const Sc = 1 + 0.045 * Ć̅;
  const Sh = 1 + 0.015 * Ć̅ * T;

  const Rt =
    -2 *
    Math.sqrt(Ć̅ ** 7 / (Ć̅ ** 7 + 25 ** 7)) *
    Math.sin(toRadians(60 * Math.exp(-(((H́̅ - 275) / 25) ** 2))));

  const lightness = ΔĹ / (Kl * Sl);
  const chroma = ΔĆ / (Kc * Sc);
  const hue = ΔH́ / (Kh * Sh);

  return Math.sqrt(lightness ** 2 + chroma ** 2 + hue ** 2 + Rt * chroma * hue);
}

export function deltaCMC(color1: LAB, color2: LAB): number {
  let { lightness: l1, chroma: c1, hue: h1 } = lch.internal(lab.toLCH(color1));
  let { lightness: l2, chroma: c2 } = lch.internal(lab.toLCH(color2));

  // We use the internal values because they are more precise, but the formula is based on external
  l1 *= 100;
  c1 *= 100;
  h1 *= 360;
  l2 *= 100;
  c2 *= 100;

  const Kl = 1.0;
  const Kc = 1.0;

  const ΔH = deltaH(color1, color2);
  const F = Math.sqrt(c1 ** 4 / (c1 ** 4 + 1900));
  const T =
    h1 >= 164 && h1 <= 345 ?
      0.56 + Math.abs(0.2 * Math.cos(toRadians(h1 + 168)))
    : 0.36 + Math.abs(0.4 * Math.cos(toRadians(h1 + 35)));

  const Sl = l1 < 16 ? 0.511 : (0.040975 * l1) / (1 + 0.01765 * l1);
  const Sc = (0.0638 * c1) / (1 + 0.0131 * c1) + 0.638;
  const Sh = Sc * (F * T + 1 - F);

  return Math.hypot((l2 - l1) / (Kl * Sl), (c2 - c1) / (Kc * Sc), ΔH / Sh);
}
