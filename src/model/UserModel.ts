import UserInterface from '../types/UserInterface';
export class UserModel implements UserInterface {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}
