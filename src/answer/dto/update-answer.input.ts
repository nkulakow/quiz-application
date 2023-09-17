import { CreateAnswerInput } from './create-answer.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAnswerInput extends PartialType(CreateAnswerInput) {
  @Field()
  id: string;
  @Field()
  answer: string;
  @Field({nullable: true})
  correct: boolean;
  @Field(()=>Int, {nullable: true})
  number: number;
  
  @Field()
  questionId: string;
}
