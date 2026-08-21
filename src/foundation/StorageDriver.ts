// Foundation: Vendor-neutral Storage Abstraction (Volume 3, Chapter 7)

import fs from 'fs';
import path from 'path';

export interface StorageDriver {
  put(key: string, data: Buffer | string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<boolean>;
}

export class LocalStorageDriver implements StorageDriver {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public async put(key: string, data: Buffer | string): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    if (typeof Bun !== 'undefined' && Bun.write) {
      await Bun.write(filePath, data);
    } else {
      fs.writeFileSync(filePath, data);
    }
    return `/uploads/${key}`;
  }

  public async get(key: string): Promise<Buffer | null> {
    const filePath = path.join(this.baseDir, key);
    if (!fs.existsSync(filePath)) return null;
    
    if (typeof Bun !== 'undefined' && Bun.file) {
      const file = Bun.file(filePath);
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    return fs.readFileSync(filePath);
  }

  public async delete(key: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}
