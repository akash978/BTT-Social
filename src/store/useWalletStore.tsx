import {create} from 'zustand'
import {Contract} from "ethers";
import {UserType} from "@/pages/Users/Users.tsx";

interface ProfileState {
    profile: UserType | null
    isInitProfile: boolean,
    isLoadingProfile: boolean,
    setProfile: (p: any) => void
    setIsLoadingProfile: (p: boolean) => void,
    contractR: Contract | null,
    contractW: Contract | null,
    setContractR: (contract: Contract) => void,
    setContractW: (contract: Contract) => void
}

export const useProfileStore = create<ProfileState>()((set) => ({
    profile: null,
    isInitProfile: false,
    isLoadingProfile: false,
    contractR: null,
    contractW: null,
    setContractR: (contract) => set({contractR: contract}),
    setContractW: (contract) => set({contractW: contract}),
    setProfile: (p) => set(() => ({
        profile: p,
        isInitProfile: true
    })),
    setIsLoadingProfile: (status) => set(() => ({
        isLoadingProfile: status
    })),
}))