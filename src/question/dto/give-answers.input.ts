import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class GiveAnswerInput {
  constructor(questionId: string, answers: string[]) {
    this.questionId = questionId;
    this.answers = answers;
  }

  @Field()
  questionId: string;
  @Field(() => [String])
  answers: string[];
}
