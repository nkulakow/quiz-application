import { InputType, Field } from "@nestjs/graphql";
import { UpdateAnswerInput } from "@ent/answer/dto/update-answer.input";
import { CreateAnswerInput } from "@ent/answer/dto/create-answer.input";

@InputType()
export class UpdateQuestionInput {
  constructor(
    id: string,
    question: string,
    singleAnswer: boolean,
    multipleAnswer: boolean,
    sorting: boolean,
    plainText: boolean,
    answers: UpdateAnswerInput[],
    newAnswers: CreateAnswerInput[],
    deleteAnswers: string[]
  ) {
    this.id = id;
    this.question = question;
    this.singleAnswer = singleAnswer;
    this.multipleAnswer = multipleAnswer;
    this.sorting = sorting;
    this.plainText = plainText;
    this.answers = answers;
    this.newAnswers = newAnswers;
    this.deleteAnswers = deleteAnswers;
  }

  @Field()
  id: string;
  @Field({ nullable: true })
  question: string;
  @Field({ nullable: true })
  singleAnswer: boolean;
  @Field({ nullable: true })
  multipleAnswer: boolean;
  @Field({ nullable: true })
  sorting: boolean;
  @Field({ nullable: true })
  plainText: boolean;

  @Field(() => [UpdateAnswerInput], { nullable: true })
  answers: UpdateAnswerInput[];

  @Field(() => [CreateAnswerInput], { nullable: true })
  newAnswers: CreateAnswerInput[];

  @Field(() => [String], { nullable: true })
  deleteAnswers: string[];
}
