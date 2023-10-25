import { Module } from "@nestjs/common";
import { AnswerSubmitterService } from "./answer-submitter.service";
import { AnswerSubmitterResolver } from "./answer-submitter.resolver";
import { QuizService } from "../quiz/quiz.service";
import { Question } from "@src/question/entities/question.entity";
import { Quiz } from "../quiz/entities/quiz.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Answer } from "@src/answer/entities/answer.entity";
import { QuestionService } from "@src/question/question.service";
import { AnswerService } from "@src/answer/answer.service";

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  providers: [
    AnswerSubmitterResolver,
    AnswerSubmitterService,
    QuizService,
    QuestionService,
    AnswerService,
  ],
})
export class AnswerSubmitterModule {}
