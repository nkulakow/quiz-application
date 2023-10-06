import { Module } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { QuestionResolver } from "./question.resolver";
import { Question } from "./entities/question.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Answer } from "src/answer/entities/answer.entity";
import { AnswerService } from "@src/answer/answer.service";

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  providers: [QuestionResolver, QuestionService, AnswerService],
})
export class QuestionModule {}
