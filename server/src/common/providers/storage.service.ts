import crypto from 'node:crypto';
import { join, extname } from 'node:path';
import { URL } from 'node:url';
import fsPromises from 'node:fs/promises';
import multer from 'multer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { appConfigFactory, storageConfigFactory } from '@Config';
import { UtilsService } from './utils.service';

@Injectable()
export class StorageService {
  diskDestination: string;
  defaultMulterOptions: MulterOptions;

  constructor(
    @Inject(appConfigFactory.KEY)
    private readonly appConfig: ConfigType<typeof appConfigFactory>,
    @Inject(storageConfigFactory.KEY)
    private readonly config: ConfigType<typeof storageConfigFactory>,
    private readonly utilsService: UtilsService,
  ) {
    this.diskDestination = this.config.diskDestination as string;
    this.defaultMulterOptions = {
      storage: multer.diskStorage({
        destination: this.diskDestination,
        filename: (req, file, cb) => {
          const extension = extname(file.originalname);
          const hash = crypto
            .createHash('md5')
            .update(file.originalname + this.utilsService.generateRandomToken())
            .digest('hex');
          cb(null, hash + extension);
        },
      }),
      limits: { fileSize: this.config.maxFileSize },
      fileFilter: (req, file, cb) => {
        const extension = extname(file.originalname).toLowerCase().trim();
        const allowedExtensions = this.config.fileExtensions.map((ext) =>
          ext.toLowerCase().trim(),
        );
        if (allowedExtensions.includes(extension)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Unsupported file type, Only allowed ${this.config.fileExtensions.join(
                ', ',
              )}`,
            ),
            false,
          );
        }
      },
    };
    this.checkPermissions();
  }

  private async checkPermissions(): Promise<void> {
    await fsPromises.access(
      join(this.diskDestination),
      fsPromises.constants.W_OK | fsPromises.constants.R_OK,
    );
  }

  async createDir(...path: string[]): Promise<void> {
    await fsPromises.mkdir(join(this.diskDestination, ...path), {
      recursive: true,
    });
  }

  async removeDir(...path: string[]): Promise<void> {
    const dirPath = join(...path);
    if (await this.exist(dirPath)) {
      return await fsPromises.rmdir(join(this.diskDestination, dirPath));
    }
  }

  async removeFile(...path: string[]): Promise<void> {
    const filePath = join(...path);
    if (await this.exist(filePath)) {
      return await fsPromises.unlink(join(this.diskDestination, filePath));
    }
  }

  async exist(...path: string[]): Promise<boolean> {
    try {
      await fsPromises.access(join(this.diskDestination, ...path));
      return true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        return false;
      }
      throw e;
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return await fsPromises.rename(
      join(this.diskDestination, oldPath),
      join(this.diskDestination, newPath),
    );
  }

  async move(
    fileOrDir: string,
    newDirPath: string,
    currentDirPath = '',
  ): Promise<void> {
    const fileOrDirPath = join(currentDirPath, fileOrDir);
      const destFilePath = join(newDirPath, fileOrDir);

      if (await this.exist(destFilePath)) {
        return;
      }

      if (!(await this.exist(fileOrDirPath))) {
        throw new Error(
          `No such file or directory exist, path ${join(
            this.diskDestination,
            fileOrDirPath,
          )}`,
        );
      }

      if (!(await this.exist(newDirPath))) {
        await this.createDir(newDirPath);
      }
      return await this.rename(
        join(currentDirPath, fileOrDir),
        join(newDirPath, fileOrDir),
      );
    }

  async moveAll(
      filesOrDirs: string[],
      newDirPath: string,
      currentDirPath = '',
    ): Promise < void> {
      if(!(await this.exist(newDirPath))) {
      await this.createDir(newDirPath);
    }

    await Promise.all(
      filesOrDirs.map(async (fileOrDir) => {
        const destFilePath = join(newDirPath, fileOrDir);
        if (await this.exist(destFilePath)) {
          return;
        }
        const fileOrDirPath = join(currentDirPath, fileOrDir);
          if (!(await this.exist(fileOrDirPath))) {
            throw new Error(
              `No such file or directory exist, path ${join(
                this.diskDestination,
                fileOrDirPath,
              )}`,
            );
          }
          return this.rename(
            fileOrDirPath,
            destFilePath,
          );
        }),
    );
  }

  getFileUrl(file: string, dir?: string): string {
    if (this.config.url) {
      const url = new URL(this.config.url);
      const filePath = join(url.pathname, dir || '', file);
      return new URL(filePath, url.origin).href;
    } else {
      const filePath = join(this.diskDestination, dir || '', file);
      return new URL(filePath, this.appConfig.serverUrl).href;
    }
  }

  resolveFileUrl(value?: string | null): string | null {
    if (!value) return null;

    let key = value;

    if (value.startsWith('http')) {
      try {
        const url = new URL(value);
        key = url.pathname.split('/').pop() || value;
      } catch {
        return null;
      }
    }
    return this.getFileUrl(key);
  }

  async saveFile(fileName: string, buffer: Buffer, dir = ''): Promise<string> {
    if (!(await this.exist(dir))) {
      await this.createDir(dir);
    }
    // full file path
    const filePath = join(this.diskDestination, dir, fileName);

    // save file
    await fsPromises.writeFile(filePath, buffer);

    // return public url
    return this.getFileUrl(fileName, dir);
  }
}
