import { Controller } from '@nestjs/common';
import { SkilltreesService } from './skilltrees.service';

@Controller('skilltrees')
export class SkilltreesController {
  constructor(private readonly skilltreesService: SkilltreesService) {}
}

