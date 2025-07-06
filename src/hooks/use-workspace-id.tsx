"use client";

import { useParams } from "next/navigation";

export function useWorkspaceId() {
  const params = useParams();

  // Extract workspaceId from the URL params
  // For route /workspaces/[workspaceId]/tasks, the param name would be workspaceId
  const workspaceId = params?.workspaceId as string;

  console.log("Extracted workspaceId:", workspaceId);

  return workspaceId;
}
