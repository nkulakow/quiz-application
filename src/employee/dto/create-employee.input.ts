import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class EmployeeCreateDTO {
    @Field()
    name: string;
    @Field()
    surname: string;
    @Field()
    designation: string;
    @Field({nullable:true})
    city: string;
    @Field()
    projectId: string;
}