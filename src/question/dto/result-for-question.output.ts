import { ObjectType, Field } from '@nestjs/graphql';
import { AnswerForResultOutput } from '@ent/answer/dto/answer-for-result.output';

@ObjectType()
export class ResultForQuestionOutput {
  @Field()
  id: string;
  @Field()
  question: string;
  @Field()
  answered: boolean;
  @Field()
  correct: boolean;
  @Field(() => [AnswerForResultOutput], { nullable: true })
  givenAnswers: AnswerForResultOutput[];
  @Field(() => [AnswerForResultOutput])
  correctAnswers: AnswerForResultOutput[];
}
