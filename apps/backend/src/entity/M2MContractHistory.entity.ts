import { Entity, Column } from 'typeorm';

@Entity()
export class M2MContractHistory {
    @Column({ type: 'int', name: 'ROWVORGANG', nullable: true })
    ROWVORGANG!: number;

    @Column({ type: 'int', name: 'ROWHIST', nullable: true })
    ROWHIST!: number;

    @Column({ type: 'varchar', name: 'BELEGART', length: 255, nullable: true })
    BELEGART!: string;

    @Column({ type: 'int', name: 'BELEGNR', nullable: true })
    BELEGNR!: number;

    @Column({ type: 'decimal', name: 'BETRAGN', precision: 10, scale: 2, nullable: true })
    BETRAGN!: number;

    @Column({ type: 'int', name: 'VORGANGNR', nullable: true })
    VORGANGNR!: number;

    @Column({ type: 'int', name: 'VERTRETER1', nullable: true })
    VERTRETER1!: number;

    @Column({ type: 'int', name: 'FIRMA', nullable: true })
    FIRMA!: number;

    @Column({ type: 'datetime', name: 'DATUM', nullable: true })
    DATUM!: Date;
}
