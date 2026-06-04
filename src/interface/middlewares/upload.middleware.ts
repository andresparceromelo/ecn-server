import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import type { Request } from 'express';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, '../../../uploads/avatars'));
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido. Usa: JPG, PNG, WebP o GIF'));
  }
}

export const uploadAvatar = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
