import { Injectable, BadRequestException } from '@nestjs/common';
import { extname, join, resolve, sep } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'lib', 'store');
  private readonly allowedExtensions = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
  ]);

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are supported');
    }

    const normalizedUploadPath = resolve(this.uploadPath);
    const fileExtension = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.has(fileExtension)) {
      throw new BadRequestException('Unsupported image file type');
    }

    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = resolve(normalizedUploadPath, fileName);
    if (!filePath.startsWith(`${normalizedUploadPath}${sep}`)) {
      throw new BadRequestException('Invalid file path');
    }

    try {
      const fileData =
        file.buffer && file.buffer.length > 0
          ? file.buffer
          : file.path
            ? readFileSync(file.path)
            : null;

      if (!fileData) {
        throw new BadRequestException('Uploaded file content is missing');
      }

      writeFileSync(filePath, fileData);
      // Return the URL path
      return `/v1/uploads/${fileName}`;
    } catch {
      throw new BadRequestException('Error saving file');
    }
  }
}
