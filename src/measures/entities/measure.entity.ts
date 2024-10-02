import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['customerCode', 'measureType', 'monthYear'])
export class Measure {
  @PrimaryGeneratedColumn('uuid')
  measureUuid: string;

  @Column()
  customerCode: string;

  @Column({ type: 'timestamp' })
  measureDateTime: Date;

  @Column()
  measureType: 'WATER' | 'GAS';

  @Column()
  measureValue: number;

  @Column({ nullable: true })
  confirmedValue: number;

  @Column()
  imageUrl: string;

  @Column()
  monthYear: string;

  @Column({ default: false })
  hasConfirmed: boolean;
}
