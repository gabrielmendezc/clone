import { ObjectType, Field, Directive } from 'type-graphql';
import User from '../../entities/User';

@ObjectType()
export default class AuthResponse {
  @Directive(
    `@provides(fields: "id username name email picture password role provider lastPasswordChange")`
  )
  @Field(() => User)
  user: User;

  @Field()
  csrfToken: string;
}
