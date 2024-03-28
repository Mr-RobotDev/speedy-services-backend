import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    sendGrid.setApiKey(this.configService.get<string>('sendgrid.key'));
  }

  async sendAccountActivationEmail(
    to: string,
    name: string,
    code: string,
  ): Promise<boolean> {
    try {
      const mail: sendGrid.MailDataRequired = {
        to,
        from: `MyPerfectAI <${this.configService.get<string>('sendgrid.from')}>`,
        dynamicTemplateData: {
          name,
          code,
        },
        templateId: this.configService.get<string>(
          'sendgrid.activateAccountTemplate',
        ),
      };

      const transport = await sendGrid.send(mail);
      return transport[0].statusCode === HttpStatus.ACCEPTED;
    } catch {
      return false;
    }
  }

  async sendForgotPasswordEmail(
    to: string,
    name: string,
    url: string,
  ): Promise<boolean> {
    try {
      const mail: sendGrid.MailDataRequired = {
        to,
        from: `MyPerfectAI <${this.configService.get<string>('sendgrid.from')}>`,
        dynamicTemplateData: {
          name,
          url,
        },
        templateId: this.configService.get<string>(
          'sendgrid.resetPasswordTemplate',
        ),
      };

      const transport = await sendGrid.send(mail);
      return transport[0].statusCode === HttpStatus.ACCEPTED;
    } catch {
      return false;
    }
  }
}
