import useSWR from "swr";

import { graphqlClient } from "@/lib/graphql";
import type { Activity } from "@/types/activity";

export const ACTIVITIES_QUERY = /* GraphQL */ `
  {
    activities {
      title
      description
      post_link
      date
    }
  }
`;

type ActivitiesResponse = {
  readonly activities: readonly Activity[];
};

export const fetchActivities = async (): Promise<readonly Activity[]> => {
  const data = await graphqlClient.request<ActivitiesResponse>(
    ACTIVITIES_QUERY,
  );
  return data.activities;
};

/**
 * SWR 官方 GraphQL pattern：以 query 字串作為 key，
 * fetcher 交給 graphql-request。
 * @param fallbackData getStaticProps 預取的資料，首屏無 loading。
 */
export const useActivities = (fallbackData?: readonly Activity[]) => {
  const { data, error, isLoading } = useSWR<readonly Activity[]>(
    ACTIVITIES_QUERY,
    fetchActivities,
    { fallbackData },
  );

  return {
    activities: data ?? [],
    error,
    isLoading,
  } as const;
};
