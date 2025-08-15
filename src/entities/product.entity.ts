import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Auction } from './auction.entity';

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombre', length: 255 })
  name!: string;

  @Column({ name: 'imageen', length: 512, nullable: true })
  imageUrl?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Auction, (auction) => auction.product)
  auctions?: Auction[];
}
