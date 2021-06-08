import React, { useContext, useEffect, useState } from "react";
import { useMyCoursesQuery, useTermsQuery } from "../../generated/graphql";
import { Wrapper } from "../../components/helpers/Wrapper";
import { Box, Center, Grid, Heading } from "@chakra-ui/react";
import { LoadingSpinner } from "../../components/helpers/LoadingSpinner";
import { CourseCheckboxListContainer } from "./CourseCheckboxListContainer";
import { TermSelectContainer } from "../TermSelectContainer";
import { TimetableContainer } from "./TimetableContainer";
import { WeekNavContainer } from "../WeekNavContainer";
import { useQueryWithError } from "../../hooks/useQueryWithError";
import {
    TimetableContext,
    TimetableSettingsContext,
} from "../../utils/timetable";
import { Set } from "immutable";
import { parseISO } from "date-fns";
import { defaultInt, defaultStr } from "../../constants";
import { getCurrentTerm, getCurrentWeek } from "../../utils/term";
import {
    firstLineHeight,
    realGap,
    timetableTimeslotHeight,
} from "../../constants/timetable";

type Props = {};

export const TimetablePageContainer: React.FC<Props> = () => {
    document.title = "Tutor Timetable";
    const [chosenTerm, setChosenTerm] = useState(defaultStr);
    const [chosenWeek, setChosenWeek] = useState(defaultInt);
    const [chosenCourses, setChosenCourses] = useState(() => Set<string>());
    const { dayStartTime, dayEndTime } = useContext(TimetableSettingsContext);
    const { data: termsData, loading: termsLoading } = useQueryWithError(
        useTermsQuery,
        {}
    );
    const {
        data: myCoursesData,
        loading: myCoursesLoading,
    } = useQueryWithError(useMyCoursesQuery, {});
    useEffect(() => {
        // Loading
        if (termsLoading) {
            return;
        }
        const today = new Date();
        // possibly an error happened
        if (!termsData) {
            return;
        }
        // No term date yet.
        if (termsData.terms.length === 0) {
            return;
        }
        let chosenTerm = getCurrentTerm(termsData.terms);
        // choose current week if current term found
        setChosenTerm(chosenTerm.id);
        const startDate = parseISO(chosenTerm.startDate);
        const endDate = parseISO(chosenTerm.endDate);
        // Choose current week if possible, otherwise choose "All weeks"
        setChosenWeek(
            startDate < today && today < endDate
                ? getCurrentWeek(chosenTerm)
                : defaultInt
        );
    }, [myCoursesLoading, termsLoading, termsData, myCoursesData]);

    return (
        <Wrapper>
            {myCoursesLoading || termsLoading ? (
                <Center h="90vh">
                    <LoadingSpinner />
                </Center>
            ) : (
                <TimetableContext.Provider
                    value={{
                        chosenTermId: chosenTerm,
                        chooseTerm: setChosenTerm,
                        chosenWeek,
                        chooseWeek: setChosenWeek,
                        chosenCourses,
                        setChosenCourses,
                    }}
                >
                    <Grid
                        templateColumns="1fr 4fr"
                        templateRows="repeat(3, auto)"
                    >
                        <Box gridRow="3 / -1">
                            <CourseCheckboxListContainer
                                chosenCourses={chosenCourses}
                                setChosenCourses={setChosenCourses}
                                chosenTermId={chosenTerm}
                            />
                        </Box>
                        <Box gridColumn={2} gridRow={1} mb={7}>
                            <Heading>Timetable</Heading>
                        </Box>
                        <Box gridColumn={2} gridRow={2} mb={5}>
                            <TermSelectContainer
                                chooseTerm={setChosenTerm}
                                chosenTerm={chosenTerm}
                            />
                        </Box>
                        <Box
                            gridColumn={2}
                            gridRow={3}
                            mb={5}
                            h={
                                firstLineHeight +
                                (dayEndTime - dayStartTime) *
                                    (timetableTimeslotHeight + realGap) +
                                realGap
                            }
                        >
                            <TimetableContainer />
                        </Box>
                        <Box gridColumn={2} gridRow={4} mb={2}>
                            <WeekNavContainer />
                        </Box>
                    </Grid>
                </TimetableContext.Provider>
            )}
        </Wrapper>
    );
};
