import { ObjectType, Field } from "@nestjs/graphql";
import { Answer } from "@ent/answer/entities/answer.entity";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Quiz } from "@ent/quiz/entities/quiz.entity";

@ObjectType()
@Entity()
export class Question {
  constructor(
    id: string,
    question: string,
    singleAnswer: boolean,
    multipleAnswer: boolean,
    sorting: boolean,
    plainText: boolean,
    answers: Answer[],
    quiz: Quiz,
    quizId: string
  ) {
    this.id = id;
    this.question = question;
    this.singleAnswer = singleAnswer;
    this.multipleAnswer = multipleAnswer;
    this.sorting = sorting;
    this.plainText = plainText;
    this.answers = answers;
    this.quiz = quiz;
    this.quizId = quizId;
  }

  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Field()
  @Column()
  question: string;
  @Field({ nullable: true })
  @Column({ nullable: true })
  singleAnswer: boolean;
  @Field({ nullable: true })
  @Column({ nullable: true })
  multipleAnswer: boolean;
  @Field({ nullable: true })
  @Column({ nullable: true })
  sorting: boolean;
  @Field({ nullable: true })
  @Column({ nullable: true })
  plainText: boolean;
  @OneToMany(() => Answer, (answer) => answer.question)
  @Field(() => [Answer])
  answers: Answer[];

  @Field({ nullable: true })
  type: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @Field(() => Quiz)
  quiz: Quiz;

  @Field()
  @Column()
  quizId: string;
}
