export class UserModel {
 

    /**
     * Getter $email
     * @return {string}
     */
	public get $email(): string {
		return this.email;
	}

    /**
     * Getter $first_name
     * @return {string}
     */
	public get $first_name(): string {
		return this.first_name;
	}

    /**
     * Getter $last_name
     * @return {string}
     */
	public get $last_name(): string {
		return this.last_name;
	}

    /**
     * Getter $password
     * @return {string}
     */
	public get $password(): string {
		return this.password;
	}

    /**
     * Getter $is_active
     * @return {boolean}
     */
	public get $is_active(): boolean {
		return this.is_active;
	}

    /**
     * Setter $email
     * @param {string} value
     */
	public set $email(value: string) {
		this.email = value;
	}

    /**
     * Setter $first_name
     * @param {string} value
     */
	public set $first_name(value: string) {
		this.first_name = value;
	}

    /**
     * Setter $last_name
     * @param {string} value
     */
	public set $last_name(value: string) {
		this.last_name = value;
	}

    /**
     * Setter $password
     * @param {string} value
     */
	public set $password(value: string) {
		this.password = value;
	}

    /**
     * Setter $is_active
     * @param {boolean} value
     */
	public set $is_active(value: boolean) {
		this.is_active = value;
	}
  private email: string;
  private first_name: string;
  private last_name: string;
  private password: string;
  private confirm_password?: string;
  private is_active: boolean;

	constructor() {
  }
  
   
}
