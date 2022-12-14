import * as multer from 'multer';
import * as path from 'path';
import s3Storage = require('multer-sharp-s3');

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const storage = (folder: string): multer.StorageEngine => {
  return multer.diskStorage({
    destination(req, file, cb) {
      const folderName = path.join(__dirname, '..', `media/${folder}`);
      cb(null, folderName);
    },

    filename(req, file, cb) {
      //* 어떤 이름으로 올릴 지
      const ext = path.extname(file.originalname);
      const fileName = `${path.basename(
        file.originalname,
        ext,
      )}${Date.now()}${ext}`;
      cb(null, fileName);
    },
  });
};

export const multerOptions = (folder: string) => {
  const result: MulterOptions = {
    storage: storage(folder),
  };

  return result;
};
