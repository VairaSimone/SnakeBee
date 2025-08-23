import fs from 'fs/promises';
import path from 'path';

export const deleteFileIfExists = async (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath.replace(/^\/+/, ''));

    await fs.access(fullPath);
    await fs.unlink(fullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`Error deleting ${filePath}:`, err.message);
    }
  }
};
