import { UserModel as User} from '../models/user.model';

export class PassengerModel { 

  public phone: string;
  public identifier: string;
  private user: User;
  

  constructor(phone: string, identifier: string, email: string, first_name: string, last_name: string, password: string) {
      //super(email, first_name, last_name, password, is_active);
      this.phone = phone;
      this.identifier = identifier;
      this.user = new User();
      this.user.$email = email;
      this.user.$first_name = first_name;
      this.user.$last_name = last_name;
      this.user.$password = password;
  }
   
}
