import fs from 'fs/promises';
import path from 'path';

export const deleteFileIfExists = async (filePath) => {
  try {
    if (!filePath) return;

    // Se è un array, ricorsione o loop
    if (Array.isArray(filePath)) {
      for (const fp of filePath) {
        await deleteFileIfExists(fp);
      }
      return;
    }

    if (typeof filePath !== 'string') {
      console.warn(`deleteFileIfExists: filePath non è una stringa:`, filePath);
      return;
    }

    const fullPath = path.join(process.cwd(), filePath.replace(/^\/+/, ''));
    await fs.access(fullPath);
    await fs.unlink(fullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`Error deleting ${filePath}:`, err.message);
    }
  }
};
