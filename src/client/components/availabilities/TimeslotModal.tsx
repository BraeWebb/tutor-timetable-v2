import React, { useCallback, useMemo } from "react";
import {
    Button,
    Divider,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
} from "@chakra-ui/react";
import {
    AvailabilityTimeslotType,
    ModifyTimeslotParams,
} from "../../types/availability";
import { Field, FieldProps, Form, Formik, FormikErrors } from "formik";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { IsoDay } from "../../../types/date";
import { isoNumberToDay } from "../../../utils/date";
import { start } from "repl";
import { FormikInput } from "../helpers/FormikInput";

type Props = {
    isOpen: boolean;
    close: () => void;
    timeslot?: AvailabilityTimeslotType;
    updateTimeslot: (
        timeslotId: number,
        newTimeslotProps: ModifyTimeslotParams
    ) => void;
};

export const TimeslotModal: React.FC<Props> = ({
    isOpen,
    close,
    timeslot,
    updateTimeslot,
}) => {
    const timeToString = useCallback((time: number) => {
        const mins = Math.round((time % 1) * 60);
        const hours = Math.floor(time);
        return format(new Date(0, 0, 0, hours, mins), "HH:mm");
    }, []);

    const stringToTime = useCallback((formatString: string) => {
        const startDate = parse(formatString, "HH:mm", new Date());
        return startDate.getHours() + startDate.getMinutes() / 60;
    }, []);

    const formState = useMemo(() => {
        if (!timeslot) {
            return {
                id: 0,
                startTime: "0",
                endTime: "24",
                day: IsoDay.MON,
            };
        }
        const startTime = timeToString(timeslot.startTime);
        const endTime = timeToString(timeslot.endTime);
        return {
            id: timeslot.id,
            startTime,
            endTime,
            day: timeslot.day,
        };
    }, [timeslot, timeToString]);
    return (
        <Modal isOpen={isOpen} onClose={close} isCentered>
            <ModalOverlay />
            <ModalContent>
                <Formik
                    initialValues={formState}
                    onSubmit={(values) => {
                        const startTime = stringToTime(values.startTime);
                        const endTime = stringToTime(values.endTime);
                        updateTimeslot(values.id, {
                            startTime,
                            endTime,
                            day: parseInt((values.day as unknown) as string),
                        });
                        close();
                    }}
                    validate={(values) => {
                        const errors: FormikErrors<typeof values> = {};
                        const startTime = stringToTime(values.startTime);
                        const endTime = stringToTime(values.endTime);
                        if (endTime <= startTime) {
                            const message =
                                "Start time must be before end time";
                            errors.startTime = message;
                            errors.endTime = message;
                        } else if (endTime - startTime < 0.25) {
                            const message =
                                "Start time and end time must be at least 15 minutes apart";
                            errors.startTime = message;
                            errors.endTime = message;
                        }
                        return errors;
                    }}
                >
                    <Form>
                        <ModalHeader>Update Availability</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <FormikInput
                                name="startTime"
                                id="startTimeAvailModal"
                                type="time"
                            />
                            <FormikInput
                                name="endTime"
                                id="endTimeAvailModal"
                                type="time"
                            />
                            <Field name="day">
                                {({ field, meta }: FieldProps) => (
                                    <FormControl id="dayAvailModal" pt={3}>
                                        <FormLabel>Day</FormLabel>
                                        <Select {...field} type="number">
                                            {[
                                                IsoDay.MON,
                                                IsoDay.TUE,
                                                IsoDay.WED,
                                                IsoDay.THU,
                                                IsoDay.FRI,
                                                IsoDay.SAT,
                                                IsoDay.SUN,
                                            ].map((day) => (
                                                <option value={day} key={day}>
                                                    {isoNumberToDay(day)}
                                                </option>
                                            ))}
                                        </Select>
                                        <FormErrorMessage>
                                            {meta.error}
                                        </FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>
                        </ModalBody>
                        <Divider py={3} />
                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} type="submit">
                                Save
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    close();
                                }}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Form>
                </Formik>
            </ModalContent>
        </Modal>
    );
};
