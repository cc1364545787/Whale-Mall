import { Controller, Post, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { S3Storage } from 'coze-coding-dev-sdk';

@Controller('upload')
export class UploadController {
  private storage: S3Storage;

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(@UploadedFile() file: any) {
    console.log('[UploadController] uploadFile:', file?.originalname);

    if (!file) {
      return { code: 400, msg: '请选择文件', data: null };
    }

    try {
      // 上传到对象存储
      const key = await this.storage.uploadFile({
        fileContent: file.buffer,
        fileName: `uploads/${Date.now()}_${file.originalname}`,
        contentType: file.mimetype,
      });

      // 生成访问 URL
      const url = await this.storage.generatePresignedUrl({
        key,
        expireTime: 86400 * 30, // 30 天有效期
      });

      console.log('[UploadController] upload success:', key);

      return {
        code: 200,
        msg: 'success',
        data: {
          key,
          url,
          filename: file.originalname,
          size: file.size,
        },
      };
    } catch (error) {
      console.error('[UploadController] upload error:', error);
      return { code: 500, msg: '上传失败', data: null };
    }
  }
}
