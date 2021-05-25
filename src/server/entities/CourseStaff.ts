import {
    Check,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    Unique,
} from "typeorm";
import { Timetable } from "./Timetable";
import { User } from "./User";
import { Preference } from "./Preference";
import { Field, ObjectType } from "type-graphql";
import { Role } from "../types/user";
import { checkFieldValueInEnum, Lazy } from "../utils/query";
import { BaseEntity } from "./BaseEntity";

@ObjectType()
@Entity()
@Check(checkFieldValueInEnum(Role, "role"))
@Unique(["timetableId", "userId"])
export class CourseStaff extends BaseEntity {
    @Field(() => Boolean)
    @Column({
        type: Boolean,
    })
    isNew: boolean;

    @Field()
    @Column()
    userId: string;

    @Column()
    timetableId: string;

    @Field(() => Timetable)
    @ManyToOne(() => Timetable, (timetable) => timetable.courseStaffs, {
        lazy: true,
    })
    timetable: Lazy<Timetable>;

    @Field(() => Role)
    @Column()
    role: Role;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.courseStaffs, { lazy: true })
    user: Lazy<User>;

    @Field(() => Preference, { nullable: true })
    @OneToOne(() => Preference, (preference) => preference.courseStaff, {
        lazy: true,
        nullable: true,
    })
    @JoinColumn()
    preference: Lazy<Preference> | undefined;
}
