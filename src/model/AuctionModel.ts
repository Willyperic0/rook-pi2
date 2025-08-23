import ItemModel from './ItemModel';

export default class AuctionModel {
    item:ItemModel
    duracion:Date
    precioInicial:number
    comision:number
    valorCompraInmediata:number
    constructor(item: ItemModel, duracion: Date, precioInicial: number, comision: number, valorCompraInmediata: number) {
        this.item = item;
        this.duracion = duracion;
        this.precioInicial = precioInicial;
        this.comision = comision;
        this.valorCompraInmediata = valorCompraInmediata;
    }
}