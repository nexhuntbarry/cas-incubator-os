import { unstable_cache } from "next/cache";
import { getServiceClient } from "@/lib/supabase";

export interface MethodStage {
  stage_number: number;
  name: string;
  description: string | null;
}

export interface ProjectType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/**
 * Cached method stages — revalidates every hour.
 * These rarely change; admins can invalidate by calling revalidateTag("method_stages").
 */
export const getMethodStages = unstable_cache(
  async (): Promise<MethodStage[]> => {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("method_stage_definitions")
      .select("stage_number, name, description")
      .order("stage_number", { ascending: true });
    return data ?? [];
  },
  ["method_stages"],
  { revalidate: 3600, tags: ["method_stages"] }
);

/**
 * Cached project types — revalidates every hour.
 */
export const getProjectTypes = unstable_cache(
  async (): Promise<ProjectType[]> => {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("project_type_definitions")
      .select("id, name, slug, description")
      .order("name", { ascending: true });
    return data ?? [];
  },
  ["project_types"],
  { revalidate: 3600, tags: ["project_types"] }
);
