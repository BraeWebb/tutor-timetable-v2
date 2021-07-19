// TODO: What this can do
//  Allow fetching from public timetable
//    if there's already data for that semester and course, add more sessions
//  Allow fetching from server
//  Allow selecting multiple sessions streams and edit/delete those streams
//  (Should store modification state of stream and color code)
//  Allow user to switch between session stream and sessions view

// TODO: Implementation
//  Store selected sessions
//  Store all sessions and their states
//  Store previous states for undo
// TODO: This should store:
//  States: Unchanged, updated, deleted, created, remove_modified sessions
import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultInt, defaultStr } from "../constants";
import {
    MergedStreamInput,
    ModificationType,
    SessionType,
    StreamAllocationPattern, StreamInput,
    StreamStaffRequirement,
    useAddMergedSessionStreamsMutation,
    useDeleteSessionsMutation,
    useDeleteSessionStreamsMutation,
    useGetMergedSessionsLazyQuery,
    useGetRootSessionStreamsLazyQuery,
    useStreamsFromPublicTimetableLazyQuery,
    useUpdateSessionAllocationMutation,
    useUpdateSessionMutation,
    useUpdateSessionStreamsMutation,
    useUpdateStreamAllocationsMutation,
} from "../generated/graphql";
import {
    useLazyQueryWithError,
    useMutationWithError,
} from "./useApolloHooksWithError";
import { useTermCourse } from "./useTermCourse";
import { useMultiSelection } from "./useMultiSelection";
import { getStreamAllocationPattern } from "../utils/session-stream";
import { List, Map } from "immutable";
import { SessionResponseType } from "../types/session";
import { StreamResponseType } from "../types/session-stream";
import { v4 as uuid } from "uuid";
import {
    SessionFields,
    SessionResponseWithModification,
    StreamState,
    StreamStateWithModification,
} from "../types/session-settings";
import isEqual from "lodash/isEqual";

const streamResponseToState = (stream: StreamResponseType): StreamState => {
    return {
        allocations: getStreamAllocationPattern(stream),
        day: stream.day,
        startTime: stream.startTime,
        endTime: stream.endTime,
        location: stream.location,
        name: stream.name,
        type: stream.type,
        baseStaffRequirement: {
            weeks: stream.weeks,
            numberOfStaff: stream.numberOfStaff,
        },
        extraStaffRequirement: stream.secondaryStreams.map((stream) => ({
            weeks: stream.weeks,
            numberOfStaff: stream.numberOfStaff,
        })),
    };
};

export const useSessionSettings = () => {
    const { courseId, termId, changeCourse, changeTerm, course, term } =
        useTermCourse();
    const [week, chooseWeek] = useState(defaultInt);
    const [sessionsByWeek, setSessionsByWeek] = useState(
        Map<number, Map<string, SessionResponseWithModification>>()
    );
    const [sessionsToWeek, setSessionToWeek] = useState(Map<string, number>());
    const [streamsById, setStreams] = useState(
        Map<string, StreamStateWithModification>()
    );
    const {
        selected: selectedStreams,
        select: selectStreams,
        deselect: deselectStreams,
        deselectAll: deselectAllStreams,
    } = useMultiSelection<string>();
    const {
        selected: selectedSessions,
        select: selectSessions,
        deselect: deselectSessions,
        deselectAll: deselectAllSessions,
    } = useMultiSelection<string>();

    // Handle fetching streams
    const [fetchStreams, { data: getStreamData, loading: streamsLoading }] =
        useLazyQueryWithError(useGetRootSessionStreamsLazyQuery, {
            fetchPolicy: "cache-and-network",
        });
    const [fetchSessions, { data: getSessionsData, loading: sessionsLoading }] =
        useLazyQueryWithError(useGetMergedSessionsLazyQuery, {
            fetchPolicy: "cache-and-network",
        });

    const selectedStreamInput = useMemo<Partial<StreamState>>(() => {
        if (selectedStreams.size === 1) {
            const selectedStreamId = List(selectedStreams).get(0)!;
            return streamsById.get(selectedStreamId)!;
        } else if (selectedStreams.size > 1) {
            const selectedStreamObjs: StreamState[] = [];
            for (const selectedStreamId of selectedStreams) {
                selectedStreamObjs.push(streamsById.get(selectedStreamId)!);
            }
            let location: string | undefined = undefined;
            let baseStaffRequirement: StreamStaffRequirement | undefined =
                undefined;
            let extraStaffRequirement: StreamStaffRequirement[] | undefined =
                undefined;
            let allocations: StreamAllocationPattern[] | undefined = undefined;
            let propertiesDefined = false;
            for (const selectedStream of selectedStreamObjs) {
                if (!propertiesDefined) {
                    location = selectedStream.location;
                    baseStaffRequirement = selectedStream.baseStaffRequirement;
                    extraStaffRequirement =
                        selectedStream.extraStaffRequirement;
                    allocations = selectedStream.allocations;
                    propertiesDefined = true;
                    continue;
                }
                if (location && selectedStream.location !== location) {
                    location = undefined;
                }
                if (
                    baseStaffRequirement &&
                    !isEqual(
                        baseStaffRequirement,
                        selectedStream.baseStaffRequirement
                    )
                ) {
                    baseStaffRequirement = undefined;
                }
                if (
                    extraStaffRequirement &&
                    !isEqual(
                        extraStaffRequirement,
                        selectedStream.extraStaffRequirement
                    )
                ) {
                    extraStaffRequirement = undefined;
                }
                if (
                    allocations &&
                    !isEqual(allocations, selectedStream.allocations)
                ) {
                    allocations = undefined;
                }
                if (
                    !location &&
                    !baseStaffRequirement &&
                    !extraStaffRequirement &&
                    !allocations
                ) {
                    break;
                }
            }
            return {
                location,
                baseStaffRequirement,
                extraStaffRequirement,
                allocations,
            };
        } else {
            return {}
        }
    }, [selectedStreams, streamsById]);

    const commitNewStreams = useCallback((streams: StreamResponseType[]) => {
        streams.forEach((stream) => {
            setStreams((prev) =>
                prev.set(stream.id, {
                    ...streamResponseToState(stream),
                    allocationModification: ModificationType.Unchanged,
                    settingsModification: ModificationType.Unchanged,
                })
            );
        });
    }, []);

    const commitNewSessions = useCallback((sessions: SessionResponseType[]) => {
        sessions.forEach((session) => {
            setSessionsByWeek((prev) =>
                prev.set(
                    session.week,
                    (
                        prev.get(session.week) ||
                        Map<string, SessionResponseWithModification>()
                    ).set(session.id, {
                        ...session,
                        settingsModification: ModificationType.Unchanged,
                        allocationModification: ModificationType.Unchanged,
                    })
                )
            );
            setSessionToWeek((prev) => prev.set(session.id, session.week));
        });
    }, []);

    // Fetch one first time
    useEffect(() => {
        if (!courseId || !termId || week !== defaultInt) {
            return;
        }
        fetchStreams({ variables: { courseIds: [courseId], termId } });
    }, [courseId, termId, fetchStreams, week, getStreamData]);

    useEffect(() => {
        if (
            !courseId ||
            !termId ||
            week === defaultInt ||
            sessionsByWeek.has(week)
        ) {
            return;
        }
        fetchSessions({ variables: { courseIds: [courseId], termId, week } });
    }, [courseId, termId, week, fetchSessions, sessionsByWeek]);

    // Always update streams after fetching
    useEffect(() => {
        if (!getStreamData) {
            return;
        }
        commitNewStreams(getStreamData.rootSessionStreams);
    }, [getStreamData, courseId, termId, commitNewStreams]);
    // Update sessions as well
    useEffect(() => {
        if (!getSessionsData) {
            return;
        }
        commitNewSessions(getSessionsData.mergedSessions);
    }, [getSessionsData, commitNewSessions]);

    // Handle editing streams
    const editMultipleStreamSettings = useCallback(
        (newStreamState: Partial<StreamState>) => {
            selectedStreams.forEach((streamId) =>
                setStreams((prev) => {
                    const stream = prev.get(streamId);
                    if (!stream) {
                        return prev;
                    }
                    if (
                        stream.settingsModification ===
                        ModificationType.Unchanged
                    ) {
                        return prev.set(streamId, {
                            ...stream,
                            ...newStreamState,
                            settingsModification: ModificationType.Modified,
                        });
                    } else if (
                        stream.settingsModification ===
                            ModificationType.Added ||
                        stream.settingsModification ===
                            ModificationType.Modified
                    ) {
                        return prev.set(streamId, {
                            ...stream,
                            ...newStreamState,
                        });
                    }
                    return prev;
                })
            );
            // TODO: Edit Allocation
        },
        [selectedStreams]
    );

    const createStream = useCallback((stream: StreamState) => {
        setStreams((prev) =>
            prev.set(uuid(), {
                ...stream,
                settingsModification: ModificationType.Added,
                allocationModification: ModificationType.Unchanged,
            })
        );
    }, []);

    const deleteStreams = useCallback((streamIds: string[]) => {
        streamIds.forEach((streamId) => {
            setStreams((prev) => {
                if (!prev.has(streamId)) {
                    return prev;
                }
                const stream = prev.get(streamId)!;
                if (stream.settingsModification === ModificationType.Added) {
                    return prev.remove(streamId);
                } else if (
                    stream.settingsModification === ModificationType.Modified
                ) {
                    return prev.set(streamId, {
                        ...stream,
                        settingsModification: ModificationType.RemovedModified,
                    });
                } else if (
                    stream.settingsModification === ModificationType.Unchanged
                ) {
                    return prev.set(streamId, {
                        ...stream,
                        settingsModification: ModificationType.Removed,
                    });
                }
                return prev;
            });
        });
    }, []);

    // Handle fetching from public timetable
    const [
        fetchFromPublicTimetable,
        { data: publicTimetableData, loading: publicTimetableLoading },
    ] = useLazyQueryWithError(useStreamsFromPublicTimetableLazyQuery, {});

    const getStreamsFromPublicTimetable = useCallback(
        (sessionTypes: SessionType[]) => {
            if (courseId === defaultStr || termId === defaultStr) {
                return;
            }
            fetchFromPublicTimetable({
                variables: {
                    courseTerm: {
                        courseId,
                        termId,
                    },
                    sessionTypes,
                },
            });
        },
        [courseId, termId, fetchFromPublicTimetable]
    );

    useEffect(() => {
        if (!publicTimetableData) {
            return;
        }
        publicTimetableData.fromPublicTimetable.forEach((stream) => {
            createStream(streamResponseToState(stream));
        });
    }, [publicTimetableData, createStream]);

    // Handle editing sessions
    const editMultipleSessions = useCallback(
        (updatedFields: SessionFields) => {
            selectedSessions.forEach((sessionId) => {
                setSessionsByWeek((prev) => {
                    const week = sessionsToWeek.get(sessionId);
                    if (!week) {
                        return prev;
                    }
                    const weekSessions = sessionsByWeek.get(week);
                    if (!weekSessions) {
                        return prev;
                    }
                    const session = weekSessions.get(sessionId);
                    if (!session) {
                        return prev;
                    }
                    return prev.set(
                        week,
                        weekSessions.set(sessionId, {
                            ...session,
                            ...updatedFields,
                            settingsModification: ModificationType.Modified,
                        })
                    );
                });
            });
        },
        [selectedSessions, sessionsToWeek, sessionsByWeek]
    );

    // Handle submitting changes
    const [
        submitUpdatedStream,
        { data: updatedStreamsData, loading: updatedStreamsLoading },
    ] = useMutationWithError(useUpdateSessionStreamsMutation, {});
    const [
        submitMergedStreams,
        { data: addMergedStreamsData, loading: addMergedStreamsLoading },
    ] = useMutationWithError(useAddMergedSessionStreamsMutation, {});
    const [
        submitDeletedStreams,
        { data: deletedStreamsData, loading: deletedStreamsLoading },
    ] = useMutationWithError(useDeleteSessionStreamsMutation, {});
    const [
        submitStreamAllocations,
        {
            data: updatedStreamAllocationData,
            loading: updatedStreamAllocationLoading,
        },
    ] = useMutationWithError(useUpdateStreamAllocationsMutation, {});

    const [
        submitUpdatedSessions,
        { data: updatedSessionsData, loading: updatedSessionsLoading },
    ] = useMutationWithError(useUpdateSessionMutation, {});
    const [
        submitDeletedSessions,
        { data: deletedSessionsData, loading: deletedSessionsLoading },
    ] = useMutationWithError(useDeleteSessionsMutation, {});
    const [
        submitSessionAllocations,
        {
            data: updatedSessionAllocationsData,
            loading: updatedSessionsAllocationLoading,
        },
    ] = useMutationWithError(useUpdateSessionAllocationMutation, {});

    const submitChanges = useCallback(() => {
        const createdStreams: StreamState[] = [];
        const modifiedStreams: [string, StreamState][] = [];
        const deletedStreamIds: string[] = [];
        const allocationModifiedStreams: [string, StreamState][] = [];
        for (const [streamId, stream] of streamsById) {
            if (stream.settingsModification === ModificationType.Added) {
                createdStreams.push(stream);
            } else if (
                stream.settingsModification === ModificationType.Modified
            ) {
                modifiedStreams.push([streamId, stream]);
            } else if (
                stream.settingsModification === ModificationType.Removed ||
                stream.settingsModification === ModificationType.RemovedModified
            ) {
                deletedStreamIds.push(streamId);
            }
            if (stream.allocationModification === ModificationType.Modified) {
                allocationModifiedStreams.push([streamId, stream]);
            }
        }
        if (createdStreams.length > 0) {
            submitMergedStreams({
                variables: {
                    sessionStreams: createdStreams.map((streamState) => ({
                        name: streamState.name,
                        type: streamState.type,
                        startTime: streamState.startTime,
                        endTime: streamState.endTime,
                        day: streamState.day,
                        location: streamState.location,
                        baseStaffRequirement: streamState.baseStaffRequirement,
                        extraStaffRequirement:
                            streamState.extraStaffRequirement,
                        courseId,
                        termId,
                    })),
                },
            });
        }
        if (modifiedStreams.length > 0) {
            submitUpdatedStream({
                variables: {
                    updateStreamInput: modifiedStreams.map(([streamId, streamState]) => ({
                        name: streamState.name,
                        type: streamState.type,
                        startTime: streamState.startTime,
                        endTime: streamState.endTime,
                        day: streamState.day,
                        location: streamState.location,
                        baseStaffRequirement: streamState.baseStaffRequirement,
                        extraStaffRequirement:
                        streamState.extraStaffRequirement,
                        streamId,
                    })),
                },
            });
        }
        if (deletedStreamIds.length > 0) {
            submitDeletedStreams({
                variables: {
                    streamIds: deletedStreamIds,
                },
            });
        }
        if (allocationModifiedStreams.length > 0) {
            submitStreamAllocations({
                variables: {
                    changeAllocationInput: allocationModifiedStreams.map(
                        ([streamId, streamState]) => ({
                            allocation: streamState.allocations,
                            streamId
                        })
                    ),
                },
            });
        }

        const modifiedSessions: SessionResponseType[] = [];
        const deletedSessionIds: string[] = [];
        const allocationModifiedSessions: SessionResponseType[] = [];
        for (const sessionEntry of sessionsByWeek) {
            const weekSessions = sessionEntry[1];
            for (const [sessionId, session] of weekSessions) {
                if (
                    session.settingsModification === ModificationType.Modified
                ) {
                    modifiedSessions.push(session);
                } else if (
                    session.settingsModification ===
                        ModificationType.RemovedModified ||
                    session.settingsModification === ModificationType.Removed
                ) {
                    deletedSessionIds.push(sessionId);
                }
                if (
                    session.allocationModification === ModificationType.Modified
                ) {
                    allocationModifiedSessions.push(session);
                }
            }
        }
        if (modifiedSessions.length > 0) {
            submitUpdatedSessions({
                variables: {
                    updateSessionInput: modifiedSessions.map((session) => ({
                        id: session.id,
                        location: session.location,
                    })),
                },
            });
        }
        if (deletedSessionIds.length > 0) {
            submitDeletedSessions({
                variables: {
                    sessionIds: deletedSessionIds,
                },
            });
        }
        if (allocationModifiedSessions.length > 0) {
            submitSessionAllocations({
                variables: {
                    newAllocation: allocationModifiedSessions.map(
                        (session) => ({
                            rootSessionId: session.id,
                            newAllocation: session.allocatedUsers.map(
                                (user) => user.id
                            ),
                        })
                    ),
                },
            });
        }
    }, [
        courseId,
        termId,
        submitMergedStreams,
        submitDeletedSessions,
        submitDeletedStreams,
        submitSessionAllocations,
        submitStreamAllocations,
        submitUpdatedSessions,
        submitUpdatedStream,
        sessionsByWeek,
        streamsById,
    ]);

    useEffect(() => {
        if (!updatedStreamsData) {
            return;
        }
        commitNewStreams(updatedStreamsData.updateSessionStreams);
    }, [updatedStreamsData, commitNewStreams]);

    useEffect(() => {
        if (!addMergedStreamsData) {
            return;
        }
        commitNewStreams(addMergedStreamsData.addMergedSessionStreams);
    }, [addMergedStreamsData, commitNewStreams]);

    useEffect(() => {
        if (!deletedStreamsData) {
            return;
        }
        deletedStreamsData.deleteSessionStreams.forEach((streamId) => {
            setStreams((prev) => prev.remove(streamId));
        });
    }, [deletedStreamsData]);

    useEffect(() => {
        if (!updatedStreamAllocationData) {
            return;
        }
    }, [updatedStreamAllocationData]);

    useEffect(() => {
        if (!updatedSessionsData) {
            return;
        }
        commitNewSessions(updatedSessionsData.updateSession);
    }, [updatedSessionsData, commitNewSessions]);

    useEffect(() => {
        if (!deletedSessionsData) {
            return;
        }
        deletedSessionsData.deleteSessions.forEach((sessionId) => {
            for (const [week] of sessionsByWeek) {
                setSessionsByWeek((prev) =>
                    prev.set(week, prev.get(week)!.delete(sessionId))
                );
                setSessionToWeek((prev) => prev.delete(sessionId));
            }
        });
    }, [deletedSessionsData, sessionsByWeek]);

    useEffect(() => {
        if (!updatedSessionAllocationsData) {
            return;
        }
        commitNewSessions(
            updatedSessionAllocationsData.updateSessionAllocations
        );
    }, [updatedSessionAllocationsData, commitNewSessions]);

    // TODO: Implement week cache
    // Save it to state
    // Allow user to modify
    // TODO: User cannot modify session weeks if allocation exists
    // TODO: User can (de)allocate other users from sessions
    return {
        selection: {
            selectedStreams,
            selectStreams,
            deselectStreams,
            deselectAllStreams,
            selectedSessions,
            selectSessions,
            deselectSessions,
            deselectAllSessions,
            selectedStreamInput,
        },
        timetableState: {
            stream: {
                streamsById,
            },
            streamActions: {
                createStream,
                deleteStreams,
                editMultipleStreamSettings,
            },
            session: {
                sessionsByWeek,
            },
            sessionActions: {
                editMultipleSessions,
            },
            streamAllocation: {},
            streamAllocationActions: {},
            sessionAllocation: {},
            sessionAllocationActions: {},
        },
        actions: {
            getStreamsFromPublicTimetable,
            submitChanges,
        },
        base: {
            courseId,
            termId,
            changeCourse,
            changeTerm,
            week,
            chooseWeek,
            course,
            term,
        },
        loading:
            streamsLoading ||
            sessionsLoading ||
            updatedStreamsLoading ||
            addMergedStreamsLoading ||
            deletedStreamsLoading ||
            updatedStreamAllocationLoading ||
            publicTimetableLoading ||
            updatedSessionsLoading ||
            updatedSessionsAllocationLoading ||
            deletedSessionsLoading,
    };
};
