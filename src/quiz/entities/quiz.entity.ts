import { ObjectType, Field } from "@nestjs/graphql";
import { Question } from "@ent/question/entities/question.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@ObjectType()
@Entity()
export class Quiz {
  constructor(id: string, name: string, questions: Question[]) {
    this.id = id;
    this.name = name;
    this.questions = questions;
  }

  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  name: string;

  @OneToMany(() => Question, (question) => question.quiz, { nullable: true })
  @Field(() => [Question], { nullable: true })
  questions: Question[];
}
