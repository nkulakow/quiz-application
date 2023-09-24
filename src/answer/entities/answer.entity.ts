import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Question } from '@ent/question/entities/question.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne  } from "typeorm";

@ObjectType()
@Entity()
export class Answer {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Field()
  @Column()
  answer: string;
  @Field({nullable: true})
  @Column({nullable: true})
  correct: boolean;
  @Field(()=>Int, {nullable: true})
  @Column({nullable: true})
  number: number;
  
  @ManyToOne(()=>Question, question=>question.answers)
  @Field(()=>Question)
  question: Question
  
  @Field()
  @Column()
  questionId: string;

}
