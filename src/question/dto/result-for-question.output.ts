import { ObjectType, Field } from "@nestjs/graphql";
import { AnswerForResultOutput } from "@ent/answer/dto/answer-for-result.output";

@ObjectType()
export class ResultForQuestionOutput {
  constructor(
    id: string,
    question: string,
    answered: boolean,
    correct: boolean,
    givenAnswers: AnswerForResultOutput[],
    correctAnswers: AnswerForResultOutput[]
  ) {
    this.id = id;
    this.question = question;
    this.answered = answered;
    this.correct = correct;
    this.givenAnswers = givenAnswers;
    this.correctAnswers = correctAnswers;
  }

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
