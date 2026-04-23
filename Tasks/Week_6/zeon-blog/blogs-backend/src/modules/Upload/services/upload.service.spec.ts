import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { UploadService } from './upload.service';

describe('UploadService', () => {
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

  it('rejects svg uploads', async () => {
    await expect(
      service.uploadFile({
        originalname: 'payload.svg',
        mimetype: 'image/svg+xml',
        buffer: Buffer.from('<svg/>'),
      } as Express.Multer.File),
    ).rejects.toThrow('Unsupported image file type');
  });

  it('accepts valid png uploads by mimetype', async () => {
    const url = await service.uploadFile({
      originalname: 'image.png',
      mimetype: 'image/png',
      buffer: Buffer.from('any-buffer-content'),
    } as Express.Multer.File);

    expect(url).toMatch(/^\/v1\/uploads\/.+\.png$/);
    const fileName = url.replace('/v1/uploads/', '');
    filesToCleanup.push(join(process.cwd(), 'lib', 'store', fileName));
  });

  it('rejects non-image mimetype uploads', async () => {
    await expect(
      service.uploadFile({
        originalname: 'file.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('content'),
      } as Express.Multer.File),
    ).rejects.toThrow('Only image uploads are supported');
  });
});
