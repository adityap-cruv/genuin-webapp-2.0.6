export type BecomeCreatorDataItem = {
    src : string;
    title: string;
    subtitle: string;
}

// TODO : add src links of the become creator 

export function BecomeCreatorData(brandName: string): BecomeCreatorDataItem[] {
    return [
        {
            src : "",
            title: `Become a creator for ${brandName}`,
            subtitle: `Join us in shaping the future of ${brandName} by making your own ${brandName} community and expanding it by sharing thought-provoking content.`
        },
        {
            src : "",
            title: "Make Connections & Spark Dialogues",
            subtitle: `Invite others to join your ${brandName} community, share engaging content, and spark meaningful conversations to make connections and foster intellectual dialogue.`
        },
        {
            src : "",
            title: "Moderate your Community",
            subtitle: "Create a safe space where your members can thrive. Customize your community with guidelines, add admins, and more."
        }
    ];
}