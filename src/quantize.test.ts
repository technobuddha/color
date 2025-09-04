/* eslint-disable no-bitwise */
import path from 'node:path';

import { Jimp } from 'jimp';

import { create2DArray } from './create-2-d-array.ts';
import { quantize, type RGB } from './quantize.ts';
import { empty } from './unicode.ts';

type Image = Awaited<ReturnType<typeof Jimp.read>>;

function pixelsFromImage(image: Image): RGB[][] {
  return create2DArray(image.bitmap.width, image.bitmap.height, (x, y) => {
    const p = image.getPixelColor(x, y);
    return {
      r: (p & 0xff000000) >>> 24,
      g: (p & 0x00ff0000) >>> 16,
      b: (p & 0x0000ff00) >>> 8,
    };
  });
}

async function testImage(filename: string, reference: string, colors: number): Promise<boolean> {
  const inputFile = path.join(path.dirname(import.meta.url).replace('file:', empty), filename);
  const referenceFile = path.join(path.dirname(import.meta.url).replace('file:', empty), reference);

  return Jimp.read(inputFile).then(async (image) => {
    const pixels = pixelsFromImage(image);
    const res = quantize(pixels.flat(), colors)!;

    return Jimp.read(referenceFile).then((refImage) => {
      const refPixels = pixelsFromImage(refImage);

      for (let x = 0; x < image.bitmap.width; ++x) {
        for (let y = 0; y < image.bitmap.height; ++y) {
          const { r: r1, g: g1, b: b1 } = refPixels[x][y];
          const { r: r2, g: g2, b: b2 } = res.map(pixels[x][y])!;

          if (r1 !== r2 || g1 !== g2 || b1 !== b2) {
            return false;
          }
        }
      }
      return true;
    });
  });
}

describe('quantize', () => {
  test('convert to 64 colors', async () => {
    expect(await testImage('rainbow256.png', 'rainbow64.png', 64)).toBeTrue();
  });
});
