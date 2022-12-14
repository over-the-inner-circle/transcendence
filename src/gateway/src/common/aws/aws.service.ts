import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sharp from 'sharp';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private awsS3: AWS.S3;

  constructor() {
    this.awsS3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      region: process.env.AWS_S3_REGION,
    });
  }

  async uploadFileToS3(
    file: Express.Multer.File,
    filepath: string,
    bucketName: string,
    region: string,
  ) {
    const wasSVG = file.mimetype === 'image/svg+xml';

    const resized = await sharp(file.buffer)
      .resize(180, 180)
      .withMetadata()
      .toBuffer();
    const key = `${filepath}/${Date.now()}_${file.originalname.replace(
      / /g,
      '',
    )}`;
    try {
      await this.awsS3
        .putObject({
          Bucket: bucketName,
          Key: key,
          Body: resized,
          // ACL: 'public-read',
          ContentType: wasSVG ? 'image/png' : file.mimetype,
        })
        .promise();
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } catch (e) {
      throw new InternalServerErrorException(
        `AWS-S3 upload fail: ${e.message}`,
      );
    }
  }
}
