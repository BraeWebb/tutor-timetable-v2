import {
    BaseEntity,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "./Course";
import { Term } from "./Term";
import { CourseStaff } from "./CourseStaff";
import { SessionStream } from "./SessionStream";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Timetable extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;
    // TODO: Unique course term?
    @Field(() => Course)
    @ManyToOne(() => Course, (course) => course.timetables)
    course: Course;

    @Field(() => Term)
    @ManyToOne(() => Term, (term) => term.timetables)
    term: Term;

    @Field(() => [CourseStaff])
    @OneToMany(() => CourseStaff, (courseStaff) => courseStaff.timetable)
    courseStaffs: CourseStaff[];

    @Field(() => [SessionStream])
    @OneToMany(() => SessionStream, (sessionStream) => sessionStream.timetable)
    sessionStreams: SessionStream[];
}
