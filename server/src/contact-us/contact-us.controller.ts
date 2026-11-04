import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactUsDto } from './dto';
import { ContactUsService } from './contact-us.service';

@Controller('contact-us')
@ApiTags('Contact Us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  async contactUs(@Body() body: ContactUsDto) {
    return await this.contactUsService.create({
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      description: body.message,
      type: body.type,
    });
  }
}
