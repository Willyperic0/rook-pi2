import ItemInterface from '../types/ItemInterface'
export default class itemModel implements ItemInterface {
    id: number;
    constructor(id:number) {
        this.id = id;
    }

}