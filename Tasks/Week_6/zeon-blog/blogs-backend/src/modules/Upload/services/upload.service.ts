import { Injectable, BadRequestException } from '@nestjs/common';
import { join, resolve, sep } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'lib', 'store');
  // Contract: uploads accept raster image MIME types only.
  // See docs/testing/upload-api-contract-checklist.md for compatibility notes.
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);
  private readonly mimeToExtension: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };

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
    if (!this.allowedMimeTypes.has(file.mimetype.toLowerCase())) {
      // Message kept stable for frontend toast/error parsing.
      throw new BadRequestException('Unsupported image file type');
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

      const normalizedUploadPath = resolve(this.uploadPath);
      const fileExtension = this.mimeToExtension[file.mimetype.toLowerCase()];
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = resolve(normalizedUploadPath, fileName);
      if (!filePath.startsWith(`${normalizedUploadPath}${sep}`)) {
        throw new BadRequestException('Invalid file path');
      }

      writeFileSync(filePath, fileData);
      // Return the URL path
      return `/v1/uploads/${fileName}`;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error saving file');
    }
  }
}
