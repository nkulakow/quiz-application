import { InputType, Field } from "@nestjs/graphql";
import { CreateAnswerInput } from "@ent/answer/dto/create-answer.input";

@InputType()
export class CreateQuestionInput {
  constructor(
    question: string,
    singleAnswer: boolean,
    multipleAnswer: boolean,
    sorting: boolean,
    plainText: boolean,
    answers: CreateAnswerInput[],
    quizId?: string
  ) {
    this.question = question;
    this.singleAnswer = singleAnswer;
    this.multipleAnswer = multipleAnswer;
    this.sorting = sorting;
    this.plainText = plainText;
    this.answers = answers;
    this.quizId = quizId;
  }

  @Field()
  question: string;
  @Field({ nullable: true })
  singleAnswer: boolean;
  @Field({ nullable: true })
  multipleAnswer: boolean;
  @Field({ nullable: true })
  sorting: boolean;
  @Field({ nullable: true })
  plainText: boolean;

  @Field(() => [CreateAnswerInput])
  answers: CreateAnswerInput[];

  @Field({ nullable: true })
  quizId: string;
}
