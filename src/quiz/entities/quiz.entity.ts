import { ObjectType, Field } from '@nestjs/graphql';
import { Question } from '@ent/question/entities/question.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany  } from "typeorm";

@ObjectType()
@Entity()
export class Quiz {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Field()
  @Column()
  name: string;
  
  @OneToMany(()=>Question, question=>question.quiz, { onDelete: 'CASCADE' , nullable: true}) 
  @Field(()=>[Question], {nullable: true})
  questions: Question[]
}
