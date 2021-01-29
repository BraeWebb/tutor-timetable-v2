import React from "react";
import { Button, Center, useDisclosure } from "@chakra-ui/react";
import { RequestModal } from "../../components/requests/RequestModal";
import { useRequestFormState } from "../../hooks/useRequestFormState";
import { RequestForm } from "../../components/requests/RequestForm";
import { useCreateRequestMutation } from "../../generated/graphql";
import { Loadable } from "../../components/helpers/Loadable";

type Props = {};

export const CreateRequestModalContainer: React.FC<Props> = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [submitForm, { data, loading }] = useCreateRequestMutation();

    const formState = useRequestFormState();
    //TODO: Placeholders, replace with actual values.
    const courseList = [0, 1, 2, 3];
    const sessionList = [0, 1, 2, 3];
    const semester = "Semester 1, 2021";

    const handleOnClose = () => {
        formState.resetFormState();
        onClose();
    };

    const handleSubmit = () => {
        submitForm({
            variables: {
                requestDetails: {
                    title: formState.title,
                    description: formState.description,
                    duration: formState.duration,
                    // TODO: replace when preferences are done.
                    preferences: [0, 2, 3],
                    //TODO: replace actual userID
                    userId: 4,
                    //TODO: replace actual sessionID
                    sessionId: 51,
                },
            },
        });
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    return (
        <>
            <Center>
                <Button onClick={onOpen}>New Request</Button>
            </Center>
            <RequestModal
                renderHeader={() => <p>Create A New Request - {semester}</p>}
                renderBody={() => (
                    <RequestForm
                        {...formState}
                        courseList={courseList}
                        sessionList={sessionList}
                    />
                )}
                renderFooterButton={() => (
                    <Loadable isLoading={loading}>
                        <Button
                            onClick={() => {
                                handleSubmit();
                            }}
                        >
                            Submit
                        </Button>
                    </Loadable>
                )}
                isOpen={isOpen}
                onClose={handleOnClose}
            />
        </>
    );
};
