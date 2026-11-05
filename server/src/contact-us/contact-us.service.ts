import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService, SendMessagePayload } from '../mail';

@Injectable()
export class ContactUsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async create(data: {
    name: string;
    email: string;
    mobile?: string;
    description?: string;
    type: string;
  }) {
    const supportEmail = this.configService.get<string>('CONTACT_US_EMAIL');
    if (!supportEmail) {
      throw new Error('Support email is not configured');
    }

    try {
      const sendMessagePayload: SendMessagePayload = {
        to: supportEmail,
        subject: `New Contact Query from Fracto`,
        mailBodyOrTemplate: {
          name: 'contact-us',
          data: {
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            description: data.description,
            type: data.type,
          },
        },
        replyTo: data.email,
      };

      await this.mailService.send(sendMessagePayload);
      return {
        success: true,
        message: 'Your request has been submitted successfully.',
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
}
