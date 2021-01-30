import { ArrayMinSize, IsString, MinLength } from "class-validator";
import {
    Arg,
    Field,
    InputType,
    Int,
    Mutation,
    Query,
    Resolver,
} from "type-graphql";
import { RequestStatus, RequestType } from "../../server/types/request";
import { Session, StaffRequest, User } from "../entities";

@InputType()
class RequestFormInputType {
    @Field()
    @MinLength(1)
    title: string;

    @Field(() => [Int])
    @ArrayMinSize(1)
    preferences: number[];

    @Field(() => RequestType)
    duration: RequestType;

    @Field({ nullable: true })
    @IsString()
    description: string;

    @Field(() => Int)
    userId: number;

    @Field(() => Int)
    sessionId: number;
}

@Resolver()
export class StaffRequestResolver {
    @Mutation(() => StaffRequest)
    async createRequest(
        @Arg("requestDetails", () => RequestFormInputType)
        {
            title,
            preferences,
            duration,
            description,
            userId,
            sessionId,
        }: RequestFormInputType
    ): Promise<StaffRequest> {
        const requester = await User.findOne({ id: userId });
        const session = await Session.findOne({ id: sessionId });
        const swapPreference = await Session.findByIds(preferences);

        const isUnique =
            (
                await StaffRequest.find({
                    requester: requester,
                    session: session,
                })
            ).length > 0
                ? false
                : true;

        if (!isUnique) {
            throw new Error(
                "You have already made a request for this session."
            );
        }

        // Currently does not store swap preferences.
        return await StaffRequest.create({
            title,
            description,
            type: duration,
            requester,
            status: RequestStatus.OPEN,
            session,
            swapPreference,
        }).save();
    }

    @Query(() => StaffRequest)
    async getRequestById(
        @Arg("requestId", () => Int) requestId: number
    ): Promise<StaffRequest> {
        const result = await StaffRequest.findOne({ id: requestId });
        if (result === undefined) {
            throw new Error("Request ID does not exist");
        } else {
            return result;
        }
    }
}
