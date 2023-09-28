import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class UpdateQuizInput {
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
  @Field()
  id: string;
  @Field()
  name: string;
}
