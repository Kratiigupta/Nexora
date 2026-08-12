import { create } from "zustand";
import type { Profile, AvailabilityStatus } from "@/types/user";

/**
 * Profile editing store — manages draft state during profile editing.
 * Keeps editing state separate from the main authStore profile.
 */
interface ProfileEditState {
  /** Draft profile being edited */
  draft: Omit<Partial<Profile>, "skills"> & {
    skills?: { skillId: string; proficiency: string }[];
    interests?: string[];
    availabilityStatus?: AvailabilityStatus;
  };

  /** Whether the profile is currently being saved */
  isSaving: boolean;

  /** Whether the draft has unsaved changes */
  isDirty: boolean;

  /** Actions */
  initDraft: (profile: Profile) => void;
  updateField: <K extends keyof ProfileEditState["draft"]>(
    field: K,
    value: ProfileEditState["draft"][K]
  ) => void;
  setSaving: (saving: boolean) => void;
  resetDraft: () => void;
}

export const useProfileEditStore = create<ProfileEditState>((set) => ({
  draft: {},
  isSaving: false,
  isDirty: false,

  initDraft: (profile) =>
    set({
      draft: {
        fullName: profile.fullName,
        username: profile.username,
        bio: profile.bio,
        department: profile.department,
        year: profile.year,
        college: profile.college,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl,
        linkedinUrl: profile.linkedinUrl,
        avatarUrl: profile.avatarUrl,
        resumeUrl: profile.resumeUrl,
        interests: profile.interests || [],
        availabilityStatus: profile.availabilityStatus,
        skills: profile.skills?.map((s) => ({
          skillId: s.skillId,
          proficiency: s.proficiency,
        })) || [],
      },
      isDirty: false,
    }),

  updateField: (field, value) =>
    set((state) => ({
      draft: { ...state.draft, [field]: value },
      isDirty: true,
    })),

  setSaving: (isSaving) => set({ isSaving }),

  resetDraft: () => set({ draft: {}, isDirty: false, isSaving: false }),
}));
