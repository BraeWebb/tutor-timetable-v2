import {
    BaseEntity,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import { SessionStream } from "./SessionStream";
import { User } from "./User";
import { Field, Int, ObjectType } from "type-graphql";
import { Lazy } from "../utils/query";

@ObjectType()
@Entity()
@Unique(["sessionStream", "user"])
export class StreamAllocation extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => SessionStream)
    @ManyToOne(
        () => SessionStream,
        (sessionStream) => sessionStream.streamAllocations,
        { lazy: true }
    )
    sessionStream: Lazy<SessionStream>;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.streamAllocations, { lazy: true })
    user: Lazy<User>;
}