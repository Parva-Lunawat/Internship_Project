import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'lib', 'store');

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

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(this.uploadPath, fileName);

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
