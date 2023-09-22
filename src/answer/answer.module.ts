import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerResolver } from './answer.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from 'src/answer/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ Answer])],
  providers: [AnswerResolver, AnswerService],
})
export class AnswerModule {}
