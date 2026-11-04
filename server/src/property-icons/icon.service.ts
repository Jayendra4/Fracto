import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { StorageService } from '@Common';

@Injectable()
export class IconService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async createIcon(data: { name: string; iconUrl: string }) {
    return await this.prisma.icons.create({
      data: {
        name: data.name,
        url: data.iconUrl,
      },
    });
  }

  async getAllIcons() {
    const icons = await this.prisma.icons.findMany();
    return icons.map((icon) => ({
      ...icon,
      url: this.storageService.resolveFileUrl(icon.url),
    }));
  }
}
