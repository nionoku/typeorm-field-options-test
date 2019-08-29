import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "cars"
})
export class Car {
    @PrimaryGeneratedColumn("increment", {
        name: "id"
    })
    public readonly id!: number;

    @Column({
        name: "model",
        type: "varchar",
        length: 20,
        comment: "Car model"
    })
    public readonly model!: string;
}