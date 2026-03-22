import { Module } from '@nestjs/common';
import { SduiService } from './sdui.service';
import { SduiController } from './sdui.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [RolesModule],
  providers: [SduiService],
  controllers: [SduiController],
})
export class SduiModule {}
