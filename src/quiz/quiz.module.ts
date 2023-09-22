import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizResolver } from './quiz.resolver';
import { Question } from '@src/question/entities/question.entity';
import { Quiz } from './entities/quiz.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '@src/answer/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  providers: [QuizResolver, QuizService],
})
export class QuizModule {}
