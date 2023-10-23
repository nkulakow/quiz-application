import { InputType, Field } from "@nestjs/graphql";
import { UpdateAnswerInput } from "@ent/answer/dto/update-answer.input";
import { CreateAnswerInput } from "@ent/answer/dto/create-answer.input";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

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
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  question: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  singleAnswer: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  multipleAnswer: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  sorting: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  plainText: boolean;

  @Field(() => [UpdateAnswerInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  answers: UpdateAnswerInput[];

  @Field(() => [CreateAnswerInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  newAnswers: CreateAnswerInput[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deleteAnswers: string[];
}
