import { type Alpha } from './color.js';
import { type ORGB, type RGB } from './rgb.js';
import rgb from './rgb.js';

export const colorNames: readonly { name: string; color: Alpha & ORGB }[] = [
  {
    name: 'Alice Blue',
    color: { r: 240, g: 248, b: 255 },
  },
  {
    name: 'Antique White',
    color: { r: 250, g: 235, b: 215 },
  },
  {
    name: 'Aqua',
    color: { r: 0, g: 255, b: 255 },
  },
  {
    name: 'Aquamarine',
    color: { r: 127, g: 255, b: 212 },
  },
  {
    name: 'Azure',
    color: { r: 240, g: 255, b: 255 },
  },
  {
    name: 'Beige',
    color: { r: 245, g: 245, b: 220 },
  },
  {
    name: 'Bisque',
    color: { r: 255, g: 228, b: 196 },
  },
  {
    name: 'Black',
    color: { r: 0, g: 0, b: 0 },
  },
  {
    name: 'Blanched Almond',
    color: { r: 255, g: 235, b: 205 },
  },
  {
    name: 'Blue',
    color: { r: 0, g: 0, b: 255 },
  },
  {
    name: 'Blue Violet',
    color: { r: 138, g: 43, b: 226 },
  },
  {
    name: 'Brown',
    color: { r: 165, g: 42, b: 42 },
  },
  {
    name: 'Burly Wood',
    color: { r: 222, g: 184, b: 135 },
  },
  {
    name: 'Cadet Blue',
    color: { r: 95, g: 158, b: 160 },
  },
  {
    name: 'Chartreuse',
    color: { r: 127, g: 255, b: 0 },
  },
  {
    name: 'Chocolate',
    color: { r: 210, g: 105, b: 30 },
  },
  {
    name: 'Coral',
    color: { r: 255, g: 127, b: 80 },
  },
  {
    name: 'Cornflower Blue',
    color: { r: 100, g: 149, b: 237 },
  },
  {
    name: 'Cornsilk',
    color: { r: 255, g: 248, b: 220 },
  },
  {
    name: 'Crimson',
    color: { r: 220, g: 20, b: 60 },
  },
  {
    name: 'Cyan',
    color: { r: 0, g: 255, b: 255 },
  },
  {
    name: 'Dark Blue',
    color: { r: 0, g: 0, b: 139 },
  },
  {
    name: 'Dark Cyan',
    color: { r: 0, g: 139, b: 139 },
  },
  {
    name: 'Dark Goldenrod',
    color: { r: 184, g: 134, b: 11 },
  },
  {
    name: 'Dark Gray',
    color: { r: 169, g: 169, b: 169 },
  },
  {
    name: 'Dark Green',
    color: { r: 0, g: 100, b: 0 },
  },
  {
    name: 'Dark Khaki',
    color: { r: 189, g: 183, b: 107 },
  },
  {
    name: 'Dark Magenta',
    color: { r: 139, g: 0, b: 139 },
  },
  {
    name: 'Dark Olive Green',
    color: { r: 85, g: 107, b: 47 },
  },
  {
    name: 'Dark Orange',
    color: { r: 255, g: 140, b: 0 },
  },
  {
    name: 'Dark Orchid',
    color: { r: 153, g: 50, b: 204 },
  },
  {
    name: 'Dark Red',
    color: { r: 139, g: 0, b: 0 },
  },
  {
    name: 'Dark Salmon',
    color: { r: 233, g: 150, b: 122 },
  },
  {
    name: 'Dark Sea Green',
    color: { r: 143, g: 188, b: 139 },
  },
  {
    name: 'Dark Slate Blue',
    color: { r: 72, g: 61, b: 139 },
  },
  {
    name: 'Dark Slate Gray',
    color: { r: 47, g: 79, b: 79 },
  },
  {
    name: 'Dark Turquoise',
    color: { r: 0, g: 206, b: 209 },
  },
  {
    name: 'Dark Violet',
    color: { r: 148, g: 0, b: 211 },
  },
  {
    name: 'Deep Pink',
    color: { r: 255, g: 20, b: 147 },
  },
  {
    name: 'Deep Sky Blue',
    color: { r: 0, g: 191, b: 255 },
  },
  {
    name: 'Dim Gray',
    color: { r: 105, g: 105, b: 105 },
  },
  {
    name: 'Dodger Blue',
    color: { r: 30, g: 144, b: 255 },
  },
  {
    name: 'Firebrick',
    color: { r: 178, g: 34, b: 34 },
  },
  {
    name: 'Floral White',
    color: { r: 255, g: 250, b: 240 },
  },
  {
    name: 'Forest Green',
    color: { r: 34, g: 139, b: 34 },
  },
  {
    name: 'Fuchsia',
    color: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'Gainsboro',
    color: { r: 220, g: 220, b: 220 },
  },
  {
    name: 'Ghost White',
    color: { r: 248, g: 248, b: 255 },
  },
  {
    name: 'Gold',
    color: { r: 255, g: 215, b: 0 },
  },
  {
    name: 'Goldenrod',
    color: { r: 218, g: 165, b: 32 },
  },
  {
    name: 'Gray',
    color: { r: 128, g: 128, b: 128 },
  },
  {
    name: 'Green',
    color: { r: 0, g: 128, b: 0 },
  },
  {
    name: 'Green Yellow',
    color: { r: 173, g: 255, b: 47 },
  },
  {
    name: 'Honeydew',
    color: { r: 240, g: 255, b: 240 },
  },
  {
    name: 'Hot Pink',
    color: { r: 255, g: 105, b: 180 },
  },
  {
    name: 'Indian Red',
    color: { r: 205, g: 92, b: 92 },
  },
  {
    name: 'Indigo',
    color: { r: 75, g: 0, b: 130 },
  },
  {
    name: 'Ivory',
    color: { r: 255, g: 255, b: 240 },
  },
  {
    name: 'Khaki',
    color: { r: 240, g: 230, b: 140 },
  },
  {
    name: 'Lavender',
    color: { r: 230, g: 230, b: 250 },
  },
  {
    name: 'Lavender Blush',
    color: { r: 255, g: 240, b: 245 },
  },
  {
    name: 'Lawn Green',
    color: { r: 124, g: 252, b: 0 },
  },
  {
    name: 'Lemon Chiffon',
    color: { r: 255, g: 250, b: 205 },
  },
  {
    name: 'Light Blue',
    color: { r: 173, g: 216, b: 230 },
  },
  {
    name: 'Light Coral',
    color: { r: 240, g: 128, b: 128 },
  },
  {
    name: 'Light Cyan',
    color: { r: 224, g: 255, b: 255 },
  },
  {
    name: 'Light Goldenrod Yellow',
    color: { r: 250, g: 250, b: 210 },
  },
  {
    name: 'Light Gray',
    color: { r: 211, g: 211, b: 211 },
  },
  {
    name: 'Light Green',
    color: { r: 144, g: 238, b: 144 },
  },
  {
    name: 'Light Pink',
    color: { r: 255, g: 182, b: 193 },
  },
  {
    name: 'Light Salmon',
    color: { r: 255, g: 160, b: 122 },
  },
  {
    name: 'Light Sea Green',
    color: { r: 32, g: 178, b: 170 },
  },
  {
    name: 'Light Sky Blue',
    color: { r: 135, g: 206, b: 250 },
  },
  {
    name: 'Light Slate Gray',
    color: { r: 119, g: 136, b: 153 },
  },
  {
    name: 'Light Steel Blue',
    color: { r: 176, g: 196, b: 222 },
  },
  {
    name: 'Light Yellow',
    color: { r: 255, g: 255, b: 224 },
  },
  {
    name: 'Lime',
    color: { r: 0, g: 255, b: 0 },
  },
  {
    name: 'Lime Green',
    color: { r: 50, g: 205, b: 50 },
  },
  {
    name: 'Linen',
    color: { r: 250, g: 240, b: 230 },
  },
  {
    name: 'Magenta',
    color: { r: 255, g: 0, b: 255 },
  },
  {
    name: 'Maroon',
    color: { r: 128, g: 0, b: 0 },
  },
  {
    name: 'Medium Aquamarine',
    color: { r: 102, g: 205, b: 170 },
  },
  {
    name: 'Medium Blue',
    color: { r: 0, g: 0, b: 205 },
  },
  {
    name: 'Medium Orchid',
    color: { r: 186, g: 85, b: 211 },
  },
  {
    name: 'Medium Purple',
    color: { r: 147, g: 112, b: 219 },
  },
  {
    name: 'Medium Sea Green',
    color: { r: 60, g: 179, b: 113 },
  },
  {
    name: 'Medium Slate Blue',
    color: { r: 123, g: 104, b: 238 },
  },
  {
    name: 'Medium Spring Green',
    color: { r: 0, g: 250, b: 154 },
  },
  {
    name: 'Medium Turquoise',
    color: { r: 72, g: 209, b: 204 },
  },
  {
    name: 'Medium Violet Red',
    color: { r: 199, g: 21, b: 133 },
  },
  {
    name: 'Midnight Blue',
    color: { r: 25, g: 25, b: 112 },
  },
  {
    name: 'Mint Cream',
    color: { r: 245, g: 255, b: 250 },
  },
  {
    name: 'Misty Rose',
    color: { r: 255, g: 228, b: 225 },
  },
  {
    name: 'Moccasin',
    color: { r: 255, g: 228, b: 181 },
  },
  {
    name: 'Navajo White',
    color: { r: 255, g: 222, b: 173 },
  },
  {
    name: 'Navy',
    color: { r: 0, g: 0, b: 128 },
  },
  {
    name: 'Old Lace',
    color: { r: 253, g: 245, b: 230 },
  },
  {
    name: 'Olive',
    color: { r: 128, g: 128, b: 0 },
  },
  {
    name: 'Olive Drab',
    color: { r: 107, g: 142, b: 35 },
  },
  {
    name: 'Orange',
    color: { r: 255, g: 165, b: 0 },
  },
  {
    name: 'Orange Red',
    color: { r: 255, g: 69, b: 0 },
  },
  {
    name: 'Orchid',
    color: { r: 218, g: 112, b: 214 },
  },
  {
    name: 'Pale Goldenrod',
    color: { r: 238, g: 232, b: 170 },
  },
  {
    name: 'Pale Green',
    color: { r: 152, g: 251, b: 152 },
  },
  {
    name: 'Pale Turquoise',
    color: { r: 175, g: 238, b: 238 },
  },
  {
    name: 'Pale Violet Red',
    color: { r: 219, g: 112, b: 147 },
  },
  {
    name: 'Papaya Whip',
    color: { r: 255, g: 239, b: 213 },
  },
  {
    name: 'Peach Puff',
    color: { r: 255, g: 218, b: 185 },
  },
  {
    name: 'Peru',
    color: { r: 205, g: 133, b: 63 },
  },
  {
    name: 'Pink',
    color: { r: 255, g: 192, b: 203 },
  },
  {
    name: 'Plum',
    color: { r: 221, g: 160, b: 221 },
  },
  {
    name: 'Powder Blue',
    color: { r: 176, g: 224, b: 230 },
  },
  {
    name: 'Purple',
    color: { r: 128, g: 0, b: 128 },
  },
  {
    name: 'Rebecca Purple',
    color: { r: 102, g: 51, b: 231 },
  },
  {
    name: 'Red',
    color: { r: 255, g: 0, b: 0 },
  },
  {
    name: 'Rosy Brown',
    color: { r: 188, g: 143, b: 143 },
  },
  {
    name: 'Royal Blue',
    color: { r: 65, g: 105, b: 225 },
  },
  {
    name: 'Saddle Brown',
    color: { r: 139, g: 69, b: 19 },
  },
  {
    name: 'Salmon',
    color: { r: 250, g: 128, b: 114 },
  },
  {
    name: 'Sandy Brown',
    color: { r: 244, g: 164, b: 96 },
  },
  {
    name: 'Sea Green',
    color: { r: 46, g: 139, b: 87 },
  },
  {
    name: 'Sea Shell',
    color: { r: 255, g: 245, b: 238 },
  },
  {
    name: 'Sienna',
    color: { r: 160, g: 82, b: 45 },
  },
  {
    name: 'Silver',
    color: { r: 192, g: 192, b: 192 },
  },
  {
    name: 'Sky Blue',
    color: { r: 135, g: 206, b: 235 },
  },
  {
    name: 'Slate Blue',
    color: { r: 106, g: 90, b: 205 },
  },
  {
    name: 'Slate Gray',
    color: { r: 112, g: 128, b: 144 },
  },
  {
    name: 'Snow',
    color: { r: 255, g: 250, b: 250 },
  },
  {
    name: 'Spring Green',
    color: { r: 0, g: 255, b: 127 },
  },
  {
    name: 'Steel Blue',
    color: { r: 70, g: 130, b: 180 },
  },
  {
    name: 'Tan',
    color: { r: 210, g: 180, b: 140 },
  },
  {
    name: 'Teal',
    color: { r: 0, g: 128, b: 128 },
  },
  {
    name: 'Thistle',
    color: { r: 216, g: 191, b: 216 },
  },
  {
    name: 'Tomato',
    color: { r: 255, g: 99, b: 71 },
  },
  {
    name: 'Turquoise',
    color: { r: 64, g: 224, b: 208 },
  },
  {
    name: 'Violet',
    color: { r: 238, g: 130, b: 238 },
  },
  {
    name: 'Wheat',
    color: { r: 245, g: 222, b: 179 },
  },
  {
    name: 'White',
    color: { r: 255, g: 255, b: 255 },
  },
  {
    name: 'White Smoke',
    color: { r: 245, g: 245, b: 245 },
  },
  {
    name: 'Yellow',
    color: { r: 255, g: 255, b: 0 },
  },
  {
    name: 'Yellow Green',
    color: { r: 154, g: 205, b: 50 },
  },
  {
    name: 'Transparent',
    color: { r: 0, g: 0, b: 0, alpha: 0 },
  },
];

function normalize(name: string): string {
  return name.toLowerCase().replaceAll(/\s/gu, '');
}

const lookupByName = Object.freeze(
  Object.fromEntries(colorNames.map((cn) => [normalize(cn.name), cn.color])),
);

export function findColor(name: string): RGB | undefined {
  const color = lookupByName[normalize(name)];
  if (color) {
    return rgb.toRGB(color);
  }
  return undefined;
}

export function findName(color: RGB): string | undefined {
  if (color.alpha === undefined) {
    const r = Math.round(color.r);
    const g = Math.round(color.g);
    const b = Math.round(color.b);

    const name = colorNames.find(
      (cn) => cn.color.r === r && cn.color.g === g && cn.color.b === b,
    )?.name;
    return name ? normalize(name) : undefined;
  }

  return undefined;
}

export default colorNames;
