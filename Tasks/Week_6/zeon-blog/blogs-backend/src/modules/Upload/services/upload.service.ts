import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
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

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(this.uploadPath, fileName);

    try {
      writeFileSync(filePath, file.buffer);
      // Return the URL path
      return `/v1/uploads/${fileName}`;
    } catch (error) {
      throw new BadRequestException('Error saving file');
    }
  }
}
