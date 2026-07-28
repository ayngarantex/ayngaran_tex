import { pageLimit } from "@/app/lib/utils";

export const fetchLooms = async (
    query: string,
    currentPage: number,
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetLooms(
                        $search: String
                    ) {
                        looms(
                            search: $search
                        ) {
                            LoomId
                            LoomName
                            Address
                            ContactNumber
                            Count   
                        }
                    }
                `,
                variables: {
                    search: query,
                    page: currentPage,
                    limit: pageLimit
                }
            })
        }
    );

    const result = await response.json();

    return result.data.looms;
};

export const fetchLoomsCount = async (
    query: string,
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetLooms(
                        $search: String
                    ) {
                        loomCount(
                            search: $search
                        )
                    }
                `,
                variables: {
                    search: query
                }
            })
        }
    );

    const result = await response.json();

    return result.data.loomCount;
};

export const fetchLoomEntriesById = async (Id: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetLoomEntriesById(
                        $Id: String
                    ) {
                        loomEntriesById(
                            LoomEntryId: $Id
                        )
                    }
                `,
                variables: {
                    Id: Id
                }
            })
        }
    );

    const result = await response.json();

    return result.data.loomCount;
}

export const createLoom = async (loomData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation CreateLoom($loomData: LoomInput!) {
                        createLoom(loomData: $loomData)
                    }
                `,
                variables: {
                    loomData
                }
            })
        }
    );

    const result = await response.json();

    return result;
}

export const fetchLoomById = async (Id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetLoomById($Id: ID!) {
                        loom(Id: $Id) {
                            LoomId
                            LoomName
                            Address
                            ContactNumber
                            Count   
                        }
                    }
                `,
                variables: {
                    Id
                }
            })
        }
    );

    const result = await response.json();

    return result.data.loom;
}

export const updateLoom = async (loomData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateLoom($loomData: LoomInput!) {
                        updateLoom(loomData: $loomData)
                    }
                `,
                variables: {
                    loomData
                }
            })
        }
    );

    const result = await response.json();

    return result;
}

export const deleteLoom = async (Id: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation DeleteLoom($Id: ID!) {
                        deleteLoom(Id: $Id)
                    }
                `,
                variables: {
                    Id
                }
            })
        }
    );

    const result = await response.json();

    return result;
}

export const fetchEntryById = async (Id: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetEntryById($Id: ID!) {
                        entry(Id: $Id) {
                            LoomEntryId
                            Date
                            Type
                            LoomId
                            Details
                            BabbinCount
                            Weight  
                        }
                    }
                `,
                variables: {
                    Id
                }
            })
        }
    );

    const result = await response.json();

    return result.data.entry;
}

export const createEntry = async (entryData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation CreateEntry($entryData: [EntryInput!]!) {
                        createEntry(entryData: $entryData)
                    }
                `,
                variables: {
                    entryData
                }
            })
        }
    );

    const result = await response.json();

    return result;
}

export const updateEntry = async (entryData: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation UpdateEntry($entryData: EntryInput!) {
                        updateEntry(entryData: $entryData)
                    }
                `,
                variables: {
                    entryData
                }
            })
        }
    );

    const result = await response.json();

    return result;
}

export const deleteEntry = async (Id: any) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    mutation DeleteEntry($Id: ID!) {
                        deleteEntry(Id: $Id)
                    }
                `,
                variables: {
                    Id
                }
            })
        }
    );

    const result = await response.json();

    return result;
}

export const fetchLoomEntriesByLoomId = async (loomId: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetLoomEntries($LoomId: ID!) {
                        loomEntries(LoomId: $LoomId) {
                            LoomEntryId
                            Date
                            Type
                            LoomId
                            Details
                            BabbinCount
                            Weight
                        }
                    }
                `,
                variables: {
                    LoomId: String(loomId)
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.loomEntries || [];
};

export const fetchSizingWarpDetailsByLoomId = async (loomId: number) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query: `
                    query GetSizingWarpDetails($LoomId: ID!) {
                        sizingWarpDetails(LoomId: $LoomId) {
                            sizingId
                            id
                            Type
                            LoomId
                            Date
                            Details
                            Weight
                            isSizingGroup
                        }
                    }
                `,
                variables: {
                    LoomId: String(loomId)
                }
            })
        }
    );

    const result = await response.json();
    return result?.data?.sizingWarpDetails || [];
};