// DTO de un item individual
export interface ItemDto {
  id: number;
  userId: number;   // importante para saber de quién es el item
  name: string;
  description: string;
}

// DTO de respuesta: lista de items
export interface UserItemsDto {
  userId: number;
  items: ItemDto[];
}