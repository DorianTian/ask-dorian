// Augment Koa Context with multer fields
// Must import to make this a module augmentation (not ambient override)
import "koa";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

declare module "koa" {
  interface Context {
    file?: MulterFile;
    files?: MulterFile[] | Record<string, MulterFile[]>;
  }
}
