import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GiveAnswerInput {
  @Field()
  questionId: string;
  @Field(()=>[String] )
  answers: string[];
}
