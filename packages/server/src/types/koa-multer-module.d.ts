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

declare module "@koa/multer" {
  import type { Context, Next } from "koa";

  interface StorageEngine {
    _handleFile(req: unknown, file: MulterFile, cb: (error: Error | null, info?: Partial<MulterFile>) => void): void;
    _removeFile(req: unknown, file: MulterFile, cb: (error: Error | null) => void): void;
  }

  type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;

  type KoaMiddleware = (ctx: Context, next: Next) => Promise<void>;

  interface Instance {
    single(fieldname: string): KoaMiddleware;
    array(fieldname: string, maxCount?: number): KoaMiddleware;
    fields(fields: Array<{ name: string; maxCount?: number }>): KoaMiddleware;
    none(): KoaMiddleware;
    any(): KoaMiddleware;
  }

  interface Options {
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?(
      req: unknown,
      file: MulterFile,
      cb: FileFilterCallback,
    ): void;
  }

  function multer(options?: Options): Instance;

  namespace multer {
    function diskStorage(options: {
      destination?:
        | string
        | ((
            req: unknown,
            file: MulterFile,
            cb: (error: Error | null, destination: string) => void,
          ) => void);
      filename?: (
        req: unknown,
        file: MulterFile,
        cb: (error: Error | null, filename: string) => void,
      ) => void;
    }): StorageEngine;

    function memoryStorage(): StorageEngine;
  }

  export = multer;
}
