import { useCallback, useEffect, useState } from "react";
import { get, post } from "../network";

const unwrapList = (data) => (Array.isArray(data) ? data : data?.data ?? data?.content ?? []);

export const contractId = (contract) => contract?.Id ?? contract?.id;

export function useContract(id) {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(!!id);
    const [acting, setActing] = useState(null);

    const fetchContract = useCallback(async () => {
        if (!id) return;
        try {
            const { data } = await get(`/tenant/contract/${id}`);
            setContract(data?.data ?? data ?? null);
        } catch (error) {
            console.error("Failed to fetch contract:", error);
        }
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            await fetchContract();
            if (!cancelled) setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [fetchContract]);

    // action is "approve" or "revert" — both move the contract to its next status server-side.
    const runAction = useCallback(async (action) => {
        setActing(action);
        try {
            await post(`/tenant/contract/${id}/${action}`);
            await fetchContract();
            return true;
        } catch (error) {
            console.error(`Failed to ${action} contract:`, error);

            throw error;
        } finally {
            setActing(null);
        }
    }, [id, fetchContract]);

    return { contract, loading, acting, runAction, refresh: fetchContract };
}

export function useCreateContract() {
    const [saving, setSaving] = useState(false);

    const createContract = useCallback(async (payload) => {
        setSaving(true);
        try {
            await post(`/tenant/contract`, payload);
            return true;
        } catch (error) {
            console.error("Failed to create contract:", error);
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    return { saving, createContract };
}

export function useESign() {
    const [signing, setSigning] = useState(false);

    const signContract = useCallback(async (id, payload) => {
        setSigning(true);
        try {
            await post(`/tenant/contract/${id}/e-sign`, payload);
            return true;
        } catch (error) {
            console.error("Failed to e-sign contract:", error);
            return false;
        } finally {
            setSigning(false);
        }
    }, []);

    return { signing, signContract };
}

export function useContracts(tenantId) {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(!!tenantId);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    useEffect(() => {
        if (!tenantId) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const { data } = await get(`/tenant/contract`);
                const list = unwrapList(data);
                if (!cancelled) setContracts(list);
            } catch (error) {
                console.error("Failed to fetch contracts:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [tenantId, reloadKey]);

    return { contracts, loading, reload };
}
