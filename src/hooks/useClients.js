import { useCallback, useEffect, useState } from "react";
import { get, post, put, del } from "../network";

export function useClients(tenantId) {
    const [clients, setClients] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(!!tenantId);

    useEffect(() => {
        if (!tenantId) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const { data } = await get(`/tenant/client`);
                const list = Array.isArray(data) ? data : data?.data ?? data?.content ?? [];
                if (!cancelled) setClients(list);
            } catch (error) {
                console.error("Failed to fetch clients:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [tenantId]);

    const addClient = useCallback(async (payload) => {
        setSaving(true);
        try {
            const { data } = await post(`/tenant/client`, payload);
            const newClient = data?.data ?? data;
            setClients((prev) => [...prev, newClient]);
            return {
                success: true,
                data: newClient,
            };
        } catch (error) {
            console.error("Failed to create client:", error);

            return {
                success: false,
                error:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Failed to create client",
            };
        } finally {
            setSaving(false);
        }
    }, [tenantId]);

    const updateClient = useCallback(async (id, payload) => {
        setSaving(true);
        try {
            const { data } = await put(`/tenant/client/${id}`, payload);
            const updated = data?.data ?? data;
            setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updated } : client)));
            return {
                success: true,
                data: updated,
            };
        } catch (error) {
            console.error("Failed to update client:", error);
            return {
                success: false,
                error:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Failed to update client",
            };
        } finally {
            setSaving(false);
        }
    }, []);

    const deleteClient = useCallback(async (id) => {
        setDeletingId(id);
        try {
            await del(`/tenant/client/${id}`);
            setClients((prev) => prev.filter((client) => client.id !== id));
            return true;
        } catch (error) {
            console.error("Failed to delete client:", error);
            return false;
        } finally {
            setDeletingId(null);
        }
    }, []);

    return { clients, loading, saving, addClient, updateClient, deleteClient, deletingId };
}
