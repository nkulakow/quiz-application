import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnswerForResultOutput {
  @Field({ nullable: true })
  id: string;
  @Field()
  answer: string;

  constructor(id: string, answer: string) {
    this.id = id;
    this.answer = answer;
  }
}
