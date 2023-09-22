import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateQuestionInput  {
  @Field()
  id: string;
  @Field({nullable: true})
  question: string;
  @Field({nullable: true})
  singleAnswer: boolean;
  @Field({nullable: true})
  multipleAnswer: boolean;
  @Field({nullable: true})
  sorting: boolean;
  @Field({nullable: true})
  plainText: boolean;
}
