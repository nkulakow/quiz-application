import { ObjectType, Field, Float } from '@nestjs/graphql';
import { ResultForQuestionOutput } from '@ent/question/dto/result-for-question.output';

@ObjectType()
export class GetResultOutput {
  @Field()
  quizId: string;
  @Field(() => Float)
  score: number;
  @Field(() => [ResultForQuestionOutput])
  questions: ResultForQuestionOutput[];
}
