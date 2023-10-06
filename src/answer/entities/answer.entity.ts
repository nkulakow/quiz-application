import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Question } from "@ent/question/entities/question.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@ObjectType()
@Entity()
export class Answer {
  constructor(
    id: string,
    answer: string,
    correct: boolean,
    number: number,
    question: Question,
    questionId: string
  ) {
    this.id = id;
    this.answer = answer;
    this.correct = correct;
    this.number = number;
    this.question = question;
    this.questionId = questionId;
  }

  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Field()
  @Column()
  answer: string;
  @Field({ nullable: true })
  @Column({ nullable: true })
  correct: boolean;
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  number: number;

  @ManyToOne(() => Question, (question) => question.answers)
  @Field(() => Question)
  question: Question;

  @Field()
  @Column()
  questionId: string;
}
