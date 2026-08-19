"use server";

import { pageLimit } from "@/app/lib/utils";
import { getLooms, getLoomCount, getLoomById, createLoom as createLoomRepo, updateLoom as updateLoomRepo, deleteLoom as deleteLoomRepo, getEntryById, createEntry as createEntryRepo, updateEntry as updateEntryRepo, deleteEntry as deleteEntryRepo, getLoomEntriesByLoomId, getSizingWarpDetailsByLoomId, getWarpSummaryEntriesByLoomId } from "@/server/repositories/loomRepositories";

export const fetchLooms = async (
    query: string,
    currentPage: number,
) => {
    try {
        const rows = await getLooms(query || null, currentPage || null, pageLimit);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchLooms Error:", err);
        return [];
    }
};

export const fetchLoomsCount = async (
    query: string,
) => {
    try {
        const count = await getLoomCount(query || null);
        return count || 0;
    } catch (err) {
        console.error("fetchLoomsCount Error:", err);
        return 0;
    }
};

export const fetchLoomEntriesById = async (Id: any) => {
    try {
        const entry = await getEntryById(Id);
        return entry ? JSON.parse(JSON.stringify(entry)) : null;
    } catch (err) {
        console.error("fetchLoomEntriesById Error:", err);
        return null;
    }
};

export const createLoom = async (loomData: any) => {
    const res = await createLoomRepo(loomData);
    return JSON.parse(JSON.stringify(res));
};

export const fetchLoomById = async (Id: string) => {
    try {
        const data = await getLoomById(Id);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchLoomById Error:", err);
        return null;
    }
};

export const updateLoom = async (loomData: any) => {
    const res = await updateLoomRepo(loomData);
    return JSON.parse(JSON.stringify(res));
};

export const deleteLoom = async (Id: string) => {
    const res = await deleteLoomRepo(Id);
    return JSON.parse(JSON.stringify(res));
};

export const fetchEntryById = async (Id: any) => {
    try {
        const data = await getEntryById(Id);
        return data ? JSON.parse(JSON.stringify(data)) : null;
    } catch (err) {
        console.error("fetchEntryById Error:", err);
        return null;
    }
};

export const createEntry = async (entryData: any) => {
    const res = await createEntryRepo(entryData);
    return JSON.parse(JSON.stringify(res));
};

export const updateEntry = async (entryData: any) => {
    const res = await updateEntryRepo(entryData);
    return JSON.parse(JSON.stringify(res));
};

export const deleteEntry = async (Id: any) => {
    const res = await deleteEntryRepo(Id);
    return JSON.parse(JSON.stringify(res));
};

export const fetchLoomEntriesByLoomId = async (loomId: number) => {
    try {
        const rows = await getLoomEntriesByLoomId(loomId);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchLoomEntriesByLoomId Error:", err);
        return [];
    }
};

export const fetchSizingWarpDetailsByLoomId = async (loomId: number) => {
    try {
        const rows = await getSizingWarpDetailsByLoomId(loomId);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchSizingWarpDetailsByLoomId Error:", err);
        return [];
    }
};

export const fetchWarpSummaryEntriesByLoomId = async (loomId: number) => {
    try {
        const rows = await getWarpSummaryEntriesByLoomId(loomId);
        return JSON.parse(JSON.stringify(rows));
    } catch (err) {
        console.error("fetchWarpSummaryEntriesByLoomId Error:", err);
        return [];
    }
};