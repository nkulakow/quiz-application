import { ObjectType, Field } from '@nestjs/graphql';
import { Answer } from 'src/answer/entities/answer.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany  } from "typeorm";

@ObjectType()
@Entity()
export class Question {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Field()
  @Column()
  question: string;
  @Field({nullable: true})
  @Column({nullable: true})
  singleAnswer: boolean;
  @Field({nullable: true})
  @Column({nullable: true})
  multipleAnswer: boolean;
  @Field({nullable: true})
  @Column({nullable: true})
  sorting: boolean;
  @Field({nullable: true})
  @Column({nullable: true})
  plainText: boolean;
  @OneToMany(()=>Answer, answer=>answer.question)
  @Field(()=>[Answer])
  answers: Answer[]
  
  @Field({nullable: true})
  type: string;
  
}


