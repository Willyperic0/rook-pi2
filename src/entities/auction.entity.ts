import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

export type AuctionStatus = 'active' | 'closed' | 'cancelled';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Product, { eager: true })
  product!: Product;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'start_price' })
  startPrice!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'current_price' })
  currentPrice!: number;

  @Column({ type: 'datetime', name: 'start_time' })
  startTime!: Date;

  @Column({ type: 'datetime', name: 'end_time' })
  endTime!: Date;

  @Column({ type: 'enum', enum: ['active','closed','cancelled'], default: 'active' })
  status!: AuctionStatus;
}

// tsconfig.json
{
  "compilerOptions": {
    // ...otros options...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
