// Response types for cluster actions
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ClusterMember {
  id: string;
  organization: {
    id: string;
    name: string;
    acronym: string | null;
  };
  created_at: Date | null;
}

export interface ClusterData {
  name: string;
  about?: string | null;
  country: string;
  districts: string[];
}

export interface ClusterUpdateData extends ClusterData {
  id: string;
}
