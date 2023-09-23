import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateAnswerInput {
  @Field()
  id: string;
  @Field()
  answer: string;
  @Field({nullable: true})
  correct: boolean;
  @Field(()=>Int, {nullable: true})
  number: number;
  
  @Field({nullable: true})
  questionId: string;
}
