import { Field, ObjectType } from "@nestjs/graphql";
import { Project } from "src/project/entities/project.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@ObjectType()
@Entity()
export class Employee {
    @Field()
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Field()
    @Column()
    name: string;
    @Field()
    @Column()
    surname: string;
    @Field()
    @Column()
    designation: string;
    @Field({nullable:true})
    @Column({nullable:true})
    city: string;
    
    @ManyToOne(()=>Project, project=>project.employees, {nullable:true})
    @Field(()=>Project, {nullable:true})
    Project: Project
    
    @Field({nullable:true})
    @Column({nullable:true})
    projectId: string;
}