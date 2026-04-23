import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UploadService } from './upload.service';

describe('UploadService (vitest)', () => {
  let service: UploadService;
  const filesToCleanup: string[] = [];

  beforeEach(() => {
    service = new UploadService();
  });

  afterEach(() => {
    for (const filePath of filesToCleanup.splice(0, filesToCleanup.length)) {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
  });

  it('uploads valid png by mime type', async () => {
    const url = await service.uploadFile({
      originalname: 'photo.png',
      mimetype: 'image/png',
      buffer: Buffer.from('png-data'),
    } as Express.Multer.File);

    expect(url).toMatch(/^\/v1\/uploads\/.+\.png$/);
    const fileName = url.replace('/v1/uploads/', '');
    filesToCleanup.push(join(process.cwd(), 'lib', 'store', fileName));
  });

  it('rejects non-image uploads', async () => {
    await expect(
      service.uploadFile({
        originalname: 'payload.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('plain-text'),
      } as Express.Multer.File),
    ).rejects.toThrow('Only image uploads are supported');
  });

  it('rejects unsupported image mime types', async () => {
    await expect(
      service.uploadFile({
        originalname: 'vector.svg',
        mimetype: 'image/svg+xml',
        buffer: Buffer.from('<svg></svg>'),
      } as Express.Multer.File),
    ).rejects.toThrow('Unsupported image file type');
  });
});
