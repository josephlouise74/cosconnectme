export interface MainImages {
    front: string;
    back: string;
}

export interface AdditionalImage {
    url: string;
    order: number;
}

export interface AddOn {
    id: string;
    name: string;
    image: string;
    price: string;
    description: string;
}

export interface CostumeType {
    type: string;
    price?: string; // For backward compatibility
    rentalPrice?: string;
    salePrice?: string;
    image?: string;
}

export interface MainOffer {
    type: string;
    price: string;
    image?: string;
}


// Product type options
export const COSTUME_TYPE = [
    { value: "costume_only", label: "Costume Only" },
    { value: "wig_only", label: "Wig Only" },
    { value: "shoes_only", label: "Shoes Only" },
    { value: "props_only", label: "Props Only" },
    { value: "accessories_only", label: "Accessories Only" },
    { value: "full_set_costume_wig", label: "Full Set (Costume + Wig)" },
    { value: "full_set_costume_shoes", label: "Full Set (Costume + Shoes)" },
    { value: "full_set_costume_wig_shoes", label: "Full Set (Costume + Wig + Shoes)" },
    { value: "full_set_costume_props", label: "Full Set (Costume + Props)" },
    { value: "full_set_costume_wig_props", label: "Full Set (Costume + Wig + Props)" },
    { value: "full_set_costume_shoes_props", label: "Full Set (Costume + Shoes + Props)" },
    { value: "full_set_costume_wig_shoes_props", label: "Complete Set (Costume + Wig + Shoes + Props)" },
    { value: "full_set_wig_shoes", label: "Wig + Shoes Set" },
    { value: "full_set_wig_props", label: "Wig + Props Set" },
    { value: "full_set_shoes_props", label: "Shoes + Props Set" },
    { value: "full_set_wig_shoes_props", label: "Wig + Shoes + Props Set" },
];


