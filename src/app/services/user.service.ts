import {Injectable} from '@angular/core';
import {User} from "../chat/model/User";

@Injectable()
export class UserService {

  constructor() {
  }


  public getCurrentUser(): User {
    let user = new User();
    user.userId = 1;
    user.alias = 'snoopy';
    user.firstName = 'Paul';
    user.lastName = 'Lachenardière';
    user.city = 'Göteborg';
    user.phone = '0733948555';
    user.department = 'Information Systems';
    user.email = 'paul.lachenardiere@alten.se';
    user.team = 'Internal';
    user.userInfo = 'No information yet...';

    return user;
  }

}
