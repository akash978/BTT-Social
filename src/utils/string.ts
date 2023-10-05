export const formatShortAddress = (longAddress: string | undefined, slice = 6) => {
    return longAddress ? `${longAddress.slice(0, slice)}...${longAddress.slice(-slice)}` : '';
};