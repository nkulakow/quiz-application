import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateQuizInput {
  @Field()
  id: string;
  @Field()
  name: string;
}
