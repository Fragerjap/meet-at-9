import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ClearUserRequest, HealthStatus, MeetingConfigPayload, MeetingDescriptionPayload, MeetingGrid, MeetingLabels, MeetingUserNames, SetCellRequest, SetDescriptionRequest, SetLabelRequest, SetMeetingConfigRequest, SetRangeRequest, SetUserNameRequest, SetUserSkipRequest } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMeetingGridUrl: () => string;
/**
 * @summary Get full meeting grid state
 */
export declare const getMeetingGrid: (options?: RequestInit) => Promise<MeetingGrid>;
export declare const getGetMeetingGridQueryKey: () => readonly ["/api/meeting/grid"];
export declare const getGetMeetingGridQueryOptions: <TData = Awaited<ReturnType<typeof getMeetingGrid>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingGrid>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMeetingGrid>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeetingGridQueryResult = NonNullable<Awaited<ReturnType<typeof getMeetingGrid>>>;
export type GetMeetingGridQueryError = ErrorType<unknown>;
/**
 * @summary Get full meeting grid state
 */
export declare function useGetMeetingGrid<TData = Awaited<ReturnType<typeof getMeetingGrid>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingGrid>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSetMeetingCellUrl: () => string;
/**
 * @summary Set a single cell value
 */
export declare const setMeetingCell: (setCellRequest: SetCellRequest, options?: RequestInit) => Promise<MeetingGrid>;
export declare const getSetMeetingCellMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingCell>>, TError, {
        data: BodyType<SetCellRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingCell>>, TError, {
    data: BodyType<SetCellRequest>;
}, TContext>;
export type SetMeetingCellMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingCell>>>;
export type SetMeetingCellMutationBody = BodyType<SetCellRequest>;
export type SetMeetingCellMutationError = ErrorType<unknown>;
/**
* @summary Set a single cell value
*/
export declare const useSetMeetingCell: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingCell>>, TError, {
        data: BodyType<SetCellRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingCell>>, TError, {
    data: BodyType<SetCellRequest>;
}, TContext>;
export declare const getSetMeetingRangeUrl: () => string;
/**
 * @summary Color a range of hours for one user in one day
 */
export declare const setMeetingRange: (setRangeRequest: SetRangeRequest, options?: RequestInit) => Promise<MeetingGrid>;
export declare const getSetMeetingRangeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingRange>>, TError, {
        data: BodyType<SetRangeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingRange>>, TError, {
    data: BodyType<SetRangeRequest>;
}, TContext>;
export type SetMeetingRangeMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingRange>>>;
export type SetMeetingRangeMutationBody = BodyType<SetRangeRequest>;
export type SetMeetingRangeMutationError = ErrorType<unknown>;
/**
* @summary Color a range of hours for one user in one day
*/
export declare const useSetMeetingRange: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingRange>>, TError, {
        data: BodyType<SetRangeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingRange>>, TError, {
    data: BodyType<SetRangeRequest>;
}, TContext>;
export declare const getGetMeetingUserNamesUrl: () => string;
/**
 * @summary Get display names for all users
 */
export declare const getMeetingUserNames: (options?: RequestInit) => Promise<MeetingUserNames>;
export declare const getGetMeetingUserNamesQueryKey: () => readonly ["/api/meeting/user-names"];
export declare const getGetMeetingUserNamesQueryOptions: <TData = Awaited<ReturnType<typeof getMeetingUserNames>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingUserNames>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMeetingUserNames>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeetingUserNamesQueryResult = NonNullable<Awaited<ReturnType<typeof getMeetingUserNames>>>;
export type GetMeetingUserNamesQueryError = ErrorType<unknown>;
/**
 * @summary Get display names for all users
 */
export declare function useGetMeetingUserNames<TData = Awaited<ReturnType<typeof getMeetingUserNames>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingUserNames>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSetMeetingUserSkipUrl: () => string;
/**
 * @summary Set skip status for a user
 */
export declare const setMeetingUserSkip: (setUserSkipRequest: SetUserSkipRequest, options?: RequestInit) => Promise<MeetingUserNames>;
export declare const getSetMeetingUserSkipMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingUserSkip>>, TError, {
        data: BodyType<SetUserSkipRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingUserSkip>>, TError, {
    data: BodyType<SetUserSkipRequest>;
}, TContext>;
export type SetMeetingUserSkipMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingUserSkip>>>;
export type SetMeetingUserSkipMutationBody = BodyType<SetUserSkipRequest>;
export type SetMeetingUserSkipMutationError = ErrorType<unknown>;
/**
* @summary Set skip status for a user
*/
export declare const useSetMeetingUserSkip: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingUserSkip>>, TError, {
        data: BodyType<SetUserSkipRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingUserSkip>>, TError, {
    data: BodyType<SetUserSkipRequest>;
}, TContext>;
export declare const getSetMeetingUserNameUrl: () => string;
/**
 * @summary Set the display name for a user
 */
export declare const setMeetingUserName: (setUserNameRequest: SetUserNameRequest, options?: RequestInit) => Promise<MeetingUserNames>;
export declare const getSetMeetingUserNameMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingUserName>>, TError, {
        data: BodyType<SetUserNameRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingUserName>>, TError, {
    data: BodyType<SetUserNameRequest>;
}, TContext>;
export type SetMeetingUserNameMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingUserName>>>;
export type SetMeetingUserNameMutationBody = BodyType<SetUserNameRequest>;
export type SetMeetingUserNameMutationError = ErrorType<unknown>;
/**
* @summary Set the display name for a user
*/
export declare const useSetMeetingUserName: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingUserName>>, TError, {
        data: BodyType<SetUserNameRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingUserName>>, TError, {
    data: BodyType<SetUserNameRequest>;
}, TContext>;
export declare const getGetMeetingLabelsUrl: () => string;
/**
 * @summary Get current day column labels
 */
export declare const getMeetingLabels: (options?: RequestInit) => Promise<MeetingLabels>;
export declare const getGetMeetingLabelsQueryKey: () => readonly ["/api/meeting/labels"];
export declare const getGetMeetingLabelsQueryOptions: <TData = Awaited<ReturnType<typeof getMeetingLabels>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingLabels>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMeetingLabels>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeetingLabelsQueryResult = NonNullable<Awaited<ReturnType<typeof getMeetingLabels>>>;
export type GetMeetingLabelsQueryError = ErrorType<unknown>;
/**
 * @summary Get current day column labels
 */
export declare function useGetMeetingLabels<TData = Awaited<ReturnType<typeof getMeetingLabels>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingLabels>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSetMeetingLabelUrl: () => string;
/**
 * @summary Set the label for a day column
 */
export declare const setMeetingLabel: (setLabelRequest: SetLabelRequest, options?: RequestInit) => Promise<MeetingLabels>;
export declare const getSetMeetingLabelMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingLabel>>, TError, {
        data: BodyType<SetLabelRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingLabel>>, TError, {
    data: BodyType<SetLabelRequest>;
}, TContext>;
export type SetMeetingLabelMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingLabel>>>;
export type SetMeetingLabelMutationBody = BodyType<SetLabelRequest>;
export type SetMeetingLabelMutationError = ErrorType<unknown>;
/**
* @summary Set the label for a day column
*/
export declare const useSetMeetingLabel: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingLabel>>, TError, {
        data: BodyType<SetLabelRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingLabel>>, TError, {
    data: BodyType<SetLabelRequest>;
}, TContext>;
export declare const getGetMeetingConfigUrl: () => string;
/**
 * @summary Get shared meeting configuration (start time, step)
 */
export declare const getMeetingConfig: (options?: RequestInit) => Promise<MeetingConfigPayload>;
export declare const getGetMeetingConfigQueryKey: () => readonly ["/api/meeting/config"];
export declare const getGetMeetingConfigQueryOptions: <TData = Awaited<ReturnType<typeof getMeetingConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMeetingConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeetingConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getMeetingConfig>>>;
export type GetMeetingConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get shared meeting configuration (start time, step)
 */
export declare function useGetMeetingConfig<TData = Awaited<ReturnType<typeof getMeetingConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSetMeetingConfigUrl: () => string;
/**
 * @summary Set shared meeting configuration
 */
export declare const setMeetingConfig: (setMeetingConfigRequest: SetMeetingConfigRequest, options?: RequestInit) => Promise<MeetingConfigPayload>;
export declare const getSetMeetingConfigMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingConfig>>, TError, {
        data: BodyType<SetMeetingConfigRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingConfig>>, TError, {
    data: BodyType<SetMeetingConfigRequest>;
}, TContext>;
export type SetMeetingConfigMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingConfig>>>;
export type SetMeetingConfigMutationBody = BodyType<SetMeetingConfigRequest>;
export type SetMeetingConfigMutationError = ErrorType<unknown>;
/**
* @summary Set shared meeting configuration
*/
export declare const useSetMeetingConfig: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingConfig>>, TError, {
        data: BodyType<SetMeetingConfigRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingConfig>>, TError, {
    data: BodyType<SetMeetingConfigRequest>;
}, TContext>;
export declare const getGetMeetingDescriptionUrl: () => string;
/**
 * @summary Get the meeting description text
 */
export declare const getMeetingDescription: (options?: RequestInit) => Promise<MeetingDescriptionPayload>;
export declare const getGetMeetingDescriptionQueryKey: () => readonly ["/api/meeting/description"];
export declare const getGetMeetingDescriptionQueryOptions: <TData = Awaited<ReturnType<typeof getMeetingDescription>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingDescription>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMeetingDescription>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeetingDescriptionQueryResult = NonNullable<Awaited<ReturnType<typeof getMeetingDescription>>>;
export type GetMeetingDescriptionQueryError = ErrorType<unknown>;
/**
 * @summary Get the meeting description text
 */
export declare function useGetMeetingDescription<TData = Awaited<ReturnType<typeof getMeetingDescription>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMeetingDescription>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSetMeetingDescriptionUrl: () => string;
/**
 * @summary Set the meeting description text
 */
export declare const setMeetingDescription: (setDescriptionRequest: SetDescriptionRequest, options?: RequestInit) => Promise<MeetingDescriptionPayload>;
export declare const getSetMeetingDescriptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingDescription>>, TError, {
        data: BodyType<SetDescriptionRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof setMeetingDescription>>, TError, {
    data: BodyType<SetDescriptionRequest>;
}, TContext>;
export type SetMeetingDescriptionMutationResult = NonNullable<Awaited<ReturnType<typeof setMeetingDescription>>>;
export type SetMeetingDescriptionMutationBody = BodyType<SetDescriptionRequest>;
export type SetMeetingDescriptionMutationError = ErrorType<unknown>;
/**
* @summary Set the meeting description text
*/
export declare const useSetMeetingDescription: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof setMeetingDescription>>, TError, {
        data: BodyType<SetDescriptionRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof setMeetingDescription>>, TError, {
    data: BodyType<SetDescriptionRequest>;
}, TContext>;
export declare const getClearMeetingUserUrl: () => string;
/**
 * @summary Clear all cells for a specific user
 */
export declare const clearMeetingUser: (clearUserRequest: ClearUserRequest, options?: RequestInit) => Promise<MeetingGrid>;
export declare const getClearMeetingUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearMeetingUser>>, TError, {
        data: BodyType<ClearUserRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof clearMeetingUser>>, TError, {
    data: BodyType<ClearUserRequest>;
}, TContext>;
export type ClearMeetingUserMutationResult = NonNullable<Awaited<ReturnType<typeof clearMeetingUser>>>;
export type ClearMeetingUserMutationBody = BodyType<ClearUserRequest>;
export type ClearMeetingUserMutationError = ErrorType<unknown>;
/**
* @summary Clear all cells for a specific user
*/
export declare const useClearMeetingUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearMeetingUser>>, TError, {
        data: BodyType<ClearUserRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof clearMeetingUser>>, TError, {
    data: BodyType<ClearUserRequest>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map