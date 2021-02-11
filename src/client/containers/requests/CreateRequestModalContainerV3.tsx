import React, { useCallback, useContext, useMemo } from "react";
import { Button, Center, useDisclosure } from "@chakra-ui/react";
import { useRequestFormState } from "../../hooks/useRequestFormState";
import { StepModal } from "../../components/helpers/StepModal";
import { StepModalStep } from "../../components/helpers/StepModalStep";
import { notSet } from "../../constants";
import { getCurrentTerm } from "../../utils/term";
import {
    useCreateRequestMutation,
    useTermsQuery,
} from "../../generated/graphql";
import { useQueryWithError } from "../../hooks/useQueryWithError";
import { CreateRequestSessionTimetableContainer } from "./CreateRequestSessionTimetableContainer";
import { RequestFormV3 } from "../../components/requests/RequestFormV3";
import { CreateRequestPreferenceTimetableContainer } from "./CreateRequestPreferenceTimetableContainer";
import { RequestReviewContainer } from "./RequestReviewContainer";
import { UserContext } from "../../utils/user";

type Props = {};

export const CreateRequestButton: React.FC<Props> = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: termsData } = useQueryWithError(useTermsQuery);
    const formState = useRequestFormState();
    const {
        title,
        description,
        duration,
        course,
        preferences,
        addPreference,
        removePreference,
        session,
        setSession,
        resetFormState,
    } = formState;

    const validateStep = useCallback(
        (step: number) => {
            switch (step) {
                case 0:
                    return title.length !== 0 && course !== notSet;
                case 1:
                    return session !== notSet;
                case 2:
                case 3:
                    return true;
                default:
                    return false;
            }
        },
        [title, course, session]
    );
    const { user } = useContext(UserContext);

    const currentTerm = useMemo(() => {
        return termsData ? getCurrentTerm(termsData.terms).id : notSet;
    }, [termsData]);
    const [submitForm, { loading: submitting }] = useCreateRequestMutation();

    return (
        <>
            <Center>
                <Button onClick={onOpen}>New Request</Button>
            </Center>
            <StepModal
                onSubmit={async () => {
                    await submitForm({
                        variables: {
                            requestDetails: {
                                title,
                                description,
                                preferences: preferences.toArray(),
                                duration,
                                userId: user.id,
                                sessionId: session,
                            },
                        },
                    });
                }}
                isSubmitting={submitting}
                validateStep={validateStep}
                stepCount={4}
                isOpen={isOpen}
                onClose={() => {
                    resetFormState();
                    onClose();
                }}
                size="6xl"
                isCentered
            >
                <StepModalStep step={0} header="Basic information">
                    <RequestFormV3 {...formState} currentTerm={currentTerm} />
                </StepModalStep>
                <StepModalStep
                    step={1}
                    header="Choose session to switch out of:"
                >
                    <CreateRequestSessionTimetableContainer
                        chosenCourseId={course}
                        chosenTermId={currentTerm}
                        chooseSession={setSession}
                        chosenSession={session}
                    />
                </StepModalStep>
                <StepModalStep
                    step={2}
                    header="Choose preferred session(s) to switch in to:"
                >
                    <CreateRequestPreferenceTimetableContainer
                        chosenCourseId={course}
                        chosenTermId={currentTerm}
                        chosenSession={session}
                        preferences={preferences}
                        addPreference={addPreference}
                        removePreference={removePreference}
                    />
                </StepModalStep>
                <StepModalStep step={3} header="Review Request Information">
                    <RequestReviewContainer
                        termId={currentTerm}
                        {...formState}
                    />
                </StepModalStep>
            </StepModal>
        </>
    );
};