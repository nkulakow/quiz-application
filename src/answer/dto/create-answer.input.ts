import { InputType, Int, Field } from "@nestjs/graphql";

@InputType()
export class CreateAnswerInput {
  constructor(
    answer: string,
    correct: boolean,
    number: number,
    questionId?: string
  ) {
    this.answer = answer;
    this.correct = correct;
    this.number = number;
    this.questionId = questionId;
  }

  @Field()
  answer: string;
  @Field({ nullable: true })
  correct: boolean;
  @Field(() => Int, { nullable: true })
  number: number;

  @Field({ nullable: true })
  questionId: string;
}
