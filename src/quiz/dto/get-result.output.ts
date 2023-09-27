import { ObjectType, Field, Float } from "@nestjs/graphql";
import { ResultForQuestionOutput } from "@ent/question/dto/result-for-question.output";

@ObjectType()
export class GetResultOutput {
  constructor(
    quizId: string,
    score: number,
    questions: ResultForQuestionOutput[]
  ) {
    this.quizId = quizId;
    this.score = score;
    this.questions = questions;
  }

  @Field()
  quizId: string;
  @Field(() => Float)
  score: number;
  @Field(() => [ResultForQuestionOutput])
  questions: ResultForQuestionOutput[];
}
