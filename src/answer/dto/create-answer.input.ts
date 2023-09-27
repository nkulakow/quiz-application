import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAnswerInput {
  @Field()
  answer: string;
  @Field({ nullable: true })
  correct: boolean;
  @Field(() => Int, { nullable: true })
  number: number;

  @Field({ nullable: true })
  questionId: string;
}
