import { Option } from "@/components/shared/multi-select";

export interface PodMember {
    id: string;
    fullName: string;
}

export interface PodData {
    name: string;
    description?: string;
    podHead?: PodMember;
    podHeadId?: string;
    recruiters?: PodMember[];
}

export interface TransformationResult {
    podName: string;
    description: string;
    selectedPodLead: string;
    selectedRecruiters: string[];
    recruiterOptions: Option[];
}

/**
 * Transforms raw API data into state-ready format for the Pod Edit form.
 * Deduplicates options and handles null/undefined values.
 */
export function transformPodUpdateData(
    availableRecruiters: any[],
    podDetails: PodData
): TransformationResult {
    const fetchedOptions: Option[] = availableRecruiters.map((r: any) => ({
        label: r.fullName,
        value: r.id || r.keycloakId
    }));

    const currentMembers: Option[] = [];
    if (podDetails.podHead) {
        currentMembers.push({ label: podDetails.podHead.fullName, value: podDetails.podHead.id });
    }
    if (podDetails.recruiters && Array.isArray(podDetails.recruiters)) {
        podDetails.recruiters.forEach((r: any) => {
            currentMembers.push({ label: r.fullName, value: r.id });
        });
    }

    // Deduplicate by value (id)
    const combinedOptions = [...fetchedOptions, ...currentMembers];
    const uniqueOptionsMap = new Map<string, Option>();
    combinedOptions.forEach(opt => {
        if (opt.value) uniqueOptionsMap.set(opt.value, opt);
    });

    const recruiterOptions = Array.from(uniqueOptionsMap.values());

    return {
        podName: podDetails.name || "",
        description: podDetails.description || "",
        selectedPodLead: podDetails.podHeadId || "",
        selectedRecruiters: podDetails.recruiters?.map((r: any) => r.id) || [],
        recruiterOptions
    };
}
