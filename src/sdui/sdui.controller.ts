import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SduiService } from './sdui.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sdui')
@UseGuards(JwtAuthGuard)
export class SduiController {
  constructor(private sduiService: SduiService) {}
  @Get('schema') getSchema(@Request() req) { return this.sduiService.buildSchema(req.user); }
}
