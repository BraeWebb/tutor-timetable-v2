import { BaseModel } from "./BaseModel";
import { Offer, StaffRequest, Timetable, User } from "../entities";
import { DeepPartial } from "typeorm";
import { PermissionState } from "../types/permission";
import {
    PERMANENT_LOCK_MESSAGE,
    RequestStatus,
    RequestType,
    TEMPORARY_LOCK_MESSAGE,
} from "../types/request";
import { FreezeState } from "../types/timetable";
import { OfferStatus } from "../types/offer";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";

export class OfferModel extends BaseModel<Offer>() {
    protected static entityCls = Offer;

    /**
     * A user can read an offer entry if they are admin OR
     * they work in the same course as the offer maker
     * @param offer
     * @param user
     * @protected
     */
    protected static async canRead(
        offer: Offer,
        user: User
    ): Promise<PermissionState> {
        const course = await offer.getCourse();
        const term = await offer.getTerm();
        return { hasPerm: await user.isStaffOf(course, term) };
    }

    /**
     * A user can update an offer if they are admin or the offer maker.
     * The offer maker can NOT change ANY of these fields
     *      * the request or requestId of the offer.
     *      * the creator of the offer (i.e. themselves)
     *      * the status of the offer (it has to be changed by the original
     *          requester when accepting or rejecting the offer.
     * The original requester CAN ONLY make change to the the offer status
     * and NO OTHER field. The status can be changed to REJECTED or ACCEPTED.
     * They can NOT change the status to ACCEPTED if there is already another
     * offer of the same request that's accepted, OR if the request's status is
     * not OPEN, OR if the requested is frozen.
     *
     * Course coordinators can change the state of the offer status from
     * AWAITING_APPROVAL to ACCEPTED or REJECTED
     *
     * @param offer
     * @param updatedFields
     * @param user
     * @protected
     */
    protected static async canUpdate(
        offer: Offer,
        updatedFields: DeepPartial<Offer>,
        user: User
    ): Promise<PermissionState> {
        const request = await Offer.loaders.staffRequest.load(offer.requestId);
        const course = await offer.getCourse();
        const term = await offer.getTerm();
        const timetable = await Timetable.fromCourseTerm(course, term);
        // If request is made from offer maker
        if (user.id === (await offer.getOwner()).id) {
            // Prevent manual change of offer status
            if (updatedFields.status && updatedFields.status !== offer.status) {
                return {
                    hasPerm: false,
                    errMsg: "You cannot manually change the offer status",
                };
            }
            // Prevent change of request id
            if (
                updatedFields.requestId &&
                updatedFields.requestId !== offer.requestId
            ) {
                return {
                    hasPerm: false,
                    errMsg: "You cannot change the request of an offer",
                };
            }
            const requestToUpdate = updatedFields.request as
                | StaffRequest
                | undefined;
            if (requestToUpdate && requestToUpdate.id !== offer.requestId) {
                return {
                    hasPerm: false,
                    errMsg: "You cannot change the request of an offer",
                };
            }
            // Prevent change of offer owner
            if (updatedFields.userId && updatedFields.userId !== offer.userId) {
                return {
                    hasPerm: false,
                    errMsg: "The offer owner has to be yourself",
                };
            }
            const owner = updatedFields.user as StaffRequest | undefined;
            if (owner && owner.id !== offer.userId) {
                return {
                    hasPerm: false,
                    errMsg: "You cannot update the owner of an offer",
                };
            }
            return { hasPerm: true };
            // If user is requester
        } else if (user.id === request.requesterId) {
            // Disallow changing any field other than `status`
            if (!isEmpty(omit(updatedFields, "status"))) {
                return { hasPerm: false };
            }
            // Disallow any operation if offer is not open
            if (offer.status !== OfferStatus.OPEN) {
                return {
                    hasPerm: false,
                    errMsg:
                        "You cannot make changes to an offer that's not open",
                };
            }
            // Always allow user to reject offer
            if (updatedFields.status === OfferStatus.REJECTED) {
                return { hasPerm: true };
            }
            // If user wants to accept request
            if (updatedFields.status === OfferStatus.ACCEPTED) {
                // Prevent user from accepting a closed request
                if (request.status !== RequestStatus.OPEN) {
                    return {
                        hasPerm: false,
                        errMsg:
                            "You cannot accept an offer of a closed request.",
                    };
                }
                if (!timetable.canAcceptRequest(request)) {
                    return {
                        hasPerm: false,
                        errMsg:
                            "Cannot accept request because requests either" +
                            " are frozen or need to be approved by course " +
                            "coordinators",
                    };
                }
                // Prevent user from accepting multiple requests
                const otherOffers = (await Offer.loaders.offer.loadMany(
                    request.offerIds
                )) as Offer[];
                if (
                    !otherOffers.some(
                        (offer) =>
                            offer.status === OfferStatus.ACCEPTED ||
                            offer.status === OfferStatus.AWAITING_APPROVAL
                    )
                ) {
                    return {
                        hasPerm: false,
                        errMsg:
                            "You have already accepted an offer for this request",
                    };
                }
            }
        }
        return { hasPerm: false };
    }

    /**
     * A user can delete an offer if
     * they are admin
     * OR
     * they are course coordinator (i.e. supervisor) of the offer maker
     * OR
     * they are the offer maker AND the status of the offer is not ACCEPTED
     * @param offer
     * @param user
     * @protected
     */
    protected static async canDelete(
        offer: Offer,
        user: User
    ): Promise<PermissionState> {
        const course = await offer.getCourse();
        const term = await offer.getTerm();
        // Course coordinator
        if (await user.isCoordinatorOf(course, term)) {
            return { hasPerm: true };
        }
        // Allow offer owner only
        if (offer.userId !== user.id) {
            return { hasPerm: false };
        }
        if (offer.status === OfferStatus.ACCEPTED) {
            return {
                hasPerm: false,
                errMsg: "You cannot delete an offer that's already accepted",
            };
        }
        return { hasPerm: true };
    }

    /**
     *
     * A user can create an offer if they are admin,
     * OR
     * if ALL of these conditions hold
     *      * They are the maker of the offer, i.e. the user field has to refer
     *          to themself
     *      * They are a staff member of the same course and term of the request
     *          maker
     *      * The request the offer is not for one of their own requests
     *      * They have not already made an offer for said request
     *      * That request is not frozen
     *      * if that request has `allowNonPrefOffers` set to false,
     *          all sessions specified in the `preferences` field have to
     *          be in the `swapPreference` field of the request.
     * @param offer
     * @param user
     * @protected
     */
    protected static async canCreate(
        offer: Offer,
        user: User
    ): Promise<PermissionState> {
        // Check if user on offer and user making request are the same person
        if (offer.userId && offer.userId !== user.id) {
            return {
                hasPerm: false,
                errMsg:
                    "You cannot create a new offer on behalf of someone else",
            };
        }
        const offerMaker = offer.user as User | undefined;
        if (offerMaker && offerMaker.id !== user.id) {
            return {
                hasPerm: false,
                errMsg:
                    "You cannot create a new offer on behalf of someone else",
            };
        }

        // Check if user works on the same course and term of the requester
        const requestId = offer.requestId || (await offer.request).id;
        const request = await this.entityCls.loaders.staffRequest.load(
            requestId
        );
        const course = await request.getCourse();
        const term = await request.getTerm();
        if (!(await user.isStaffOf(course, term))) {
            return {
                hasPerm: false,
                errMsg:
                    "You cannot make an offer for a request of another course",
            };
        }
        // Check if offer is for a request of that user
        const requester = await request.getOwner();
        if (requester.id === user.id) {
            return {
                hasPerm: false,
                errMsg: "You cannot make an offer for a request of your own",
            };
        }
        // Check if user already has an offer of that request
        const offersMade = (await this.entityCls.loaders.offer.loadMany(
            user.offerIds
        )) as Offer[];
        const requestIds = offersMade.map((offer) => offer.requestId);
        if (requestIds.includes(requestId)) {
            return {
                hasPerm: false,
                errMsg: "You already made an offer for this request",
            };
        }
        // Check if request is frozen
        const timetable = await Timetable.fromCourseTerm(course, term);
        // Temporary request
        if (request.type === RequestType.TEMPORARY) {
            // Cannot make offer if frozen
            if (timetable.temporaryRequestLock === FreezeState.LOCK) {
                return {
                    hasPerm: false,
                    errMsg: TEMPORARY_LOCK_MESSAGE,
                };
            }
        } else if (request.type === RequestType.PERMANENT) {
            // Cannot make offer if frozen
            if (timetable.permanentRequestLock === FreezeState.LOCK) {
                return {
                    hasPerm: false,
                    errMsg: PERMANENT_LOCK_MESSAGE,
                };
            }
        }
        if (!request.allowNonPrefOffers) {
            const sessionPreferenceIds = (await offer.preferences).map(
                (session) => session.id
            );
            // If any of sessionPreferenceIds not in request.swapPreference
            if (
                sessionPreferenceIds.some(
                    (sessionId) =>
                        !request.swapPreferenceSessionIds.includes(sessionId)
                )
            ) {
                return {
                    hasPerm: false,
                    errMsg:
                        "You cannot specify a session that's not included" +
                        "in the original swap preference",
                };
            }
        }
        return { hasPerm: true };
    }
}
