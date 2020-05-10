import { InputType, Field } from 'type-graphql';

@InputType('UserInput')
export default class UserInput {
  @Field({ nullable: true })
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  role: string;

  @Field({ nullable: true })
  provider: string;

  @Field({ nullable: true })
  picture: string;
}
