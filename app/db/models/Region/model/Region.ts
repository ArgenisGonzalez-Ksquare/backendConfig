import { BaseModel } from "@/libraries/BaseModel";
import { Column, DataType, HasMany, Table } from "sequelize-typescript";
import { Employee } from "../../Employee/model/Employee";

@Table({
  tableName: "region",
})
export class Region extends BaseModel<Region> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  regionCodeAlphaThree: string;

  @HasMany(() => Employee, "regionId")
  employees: Employee[];
}
