import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuPlus, LuLayoutGrid, LuTable, LuEye, LuPencil, LuTrash2, LuEllipsisVertical } from "react-icons/lu";
import Button from "../../common/Button/Button";
import Loader from "../../common/Loader/Loader";
import Modal from "../../Modal";
import { useAuth } from "../../context/AuthContext";
import { useClients } from "../../hooks/useClients";
import {addClientSchema} from "../../schema/client/addClientSchema.js";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import Input from "../../common/Input/Input.jsx";
import ErrorMessage from "../../common/Error/ErrorMessage.jsx";
import {AiOutlineFieldTime} from "react-icons/ai";

const COLUMNS = ["Logo", "Name", "Mobile", "Email", "Address", "City", "State", "Pincode", "Country", "Actions"];

const FORM = {
    name: "",
    email: "",
    mobile: "",
    pan: "",
    gst: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
};

function ClientActionsMenu({ client, onView, onEdit, setConfirmModalOpen }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const closeTimer = useRef(null);

    const openMenu = () => {
        clearTimeout(closeTimer.current);
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + 4, left: rect.right - 128 });
        setOpen(true);
    };

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                aria-label="Client actions"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-primary-light hover:text-text-primary"
            >
                <LuEllipsisVertical className="h-4 w-4" />
            </button>

            {open &&
                createPortal(
                    <div
                        style={{ position: "fixed", top: coords.top, left: coords.left, width: 128 }}
                        onMouseEnter={openMenu}
                        onMouseLeave={scheduleClose}
                        className="z-50 flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onView(client);
                            }}
                            className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-xs font-medium text-text-primary hover:bg-primary-light"
                        >
                            <LuEye className="h-3.5 w-3.5" />
                            View
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onEdit(client);
                            }}
                            className="flex items-center gap-2 whitespace-nowrap border-t border-border px-3 py-2 text-xs font-medium text-text-primary hover:bg-primary-light"
                        >
                            <LuPencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setConfirmModalOpen(client);
                            }}
                            className="flex items-center gap-2 whitespace-nowrap border-t border-border px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <LuTrash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default function Client() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const { clients, loading, saving, addClient, updateClient, deleteClient } = useClients(tenantId);

    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState("table");
    const [clientModal, setClientModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(addClientSchema),
        defaultValues: FORM,
    });

    const filteredClients = clients.filter((client) =>
        (client.name ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const closeClientModal = () => {
        setClientModal(false);
        setEditingClient(null);
        setApiError(null);
        reset(FORM);
    };

    const openEditModal = (client) => {
        setApiError(null);
        setEditingClient(client);
        reset({
            ...FORM,
            ...client,
        });
        setClientModal(true);
    };

    const openClientDetail = (client) => {
        navigate(`/client/${client.id}`, { state: { client } });
    };

    const handleSubmitForm = async (data) => {
        setApiError(null);

        const result = editingClient
            ? await updateClient(editingClient.id, data)
            : await addClient(data);

        if (result.success) {
            closeClientModal();
            return;
        }

        setApiError(result.error);
    };

    const handleDelete = async () => {
        setApiError("");
        setDeleteLoading(true);
        const success = await deleteClient(confirmModalOpen.id);
        if(success){
            setConfirmModalOpen(null);
            setApiError("");
        }
        setDeleteLoading(false);
    };

    const openAddClientModal = () => {
        setApiError(null);
        setEditingClient(null);
        reset(FORM);
        setClientModal(true);
    };

    return (
        <div>
            <h1 className="text-xl font-semibold text-text-primary">Clients</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage all clients in your workspace</p>

            <div className="mt-6 flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search clients"
                        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <span className="whitespace-nowrap text-sm text-text-secondary">
                        {filteredClients.length} Clients
                    </span>
                    <button
                        type="button"
                        onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
                        className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                    >
                        {viewMode === "table" ? <LuLayoutGrid className="h-4 w-4" /> : <LuTable className="h-4 w-4" />}
                        {viewMode === "table" ? "Card View" : "Table View"}
                    </button>
                    <Button className="!w-auto flex items-center gap-2 !py-2 px-4" onClick={openAddClientModal}>
                        <LuPlus className="h-4 w-4" />
                        Add Client
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="mt-6 rounded-xl border border-border">
                    <Loader label="Loading clients..." />
                </div>
            ) : viewMode === "table" ? (
                <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {COLUMNS.map((col) => (
                                    <th key={col} className="whitespace-nowrap px-4 py-3 font-semibold text-primary-text">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="border-b border-border last:border-b-0">
                                    <td className="px-4 py-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-text">
                                            {(client.name ?? "?").charAt(0)}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-primary">{client.name || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.mobile || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.email || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.address || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.city || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.state || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.pincode || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{client.country || "-"}</td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <ClientActionsMenu
                                            client={client}
                                            onView={openClientDetail}
                                            onEdit={openEditModal}
                                            setConfirmModalOpen={setConfirmModalOpen}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-sm text-text-secondary">
                                        No clients found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                    {filteredClients?.length ? filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="rounded-xl border border-border bg-surface"
                        >
                            <div className="w-full flex justify-start items-center px-4 py-4 gap-4">
                                <div
                                    className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-[13px] font-semibold text-primary-text">
                                    {client?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="w-full flex flex-col justify-center items-start">
                                    <p className="flex-1 truncate text-lg max-w-[80%]">
                                        {client?.name}
                                    </p>
                                    <p className="text-sm max-w-[80%] truncate flex-1">
                                        {client?.email}
                                    </p>
                                </div>
                                <ClientActionsMenu
                                    client={client}
                                    onView={openClientDetail}
                                    onEdit={openEditModal}
                                    setConfirmModalOpen={setConfirmModalOpen}
                                />
                            </div>
                            <hr className="border border-primary-light"/>
                            <div className="w-full flex flex-col gap-1 px-4 py-4">
                                <p className="text-sm">
                                    <span className="text-primary font-bold">PAN - </span>{" "}
                                    {client?.pan}
                                </p>
                                <p className="text-sm">
                                    <span className="text-primary font-bold">GST - </span>{" "}
                                    {client?.gst}
                                </p>
                                <p className="text-sm">
                                    <span className="text-primary font-bold">Mobile - </span>{" "}
                                    {client?.mobile}
                                </p>
                            </div>
                            <hr className="border border-primary-light"/>
                            <div className="w-full flex justify-end items-center px-4 py-2">
                                <p className="text-text-secondary text-sm uppercase">
                                    <div className="w-full flex gap-1 items-center justify-end text-xs">
                                        <AiOutlineFieldTime size={16}/>
                                        <span className="text-xs text-text-secondary">
                                            {client.updatedAt
                                                ? new Date(client.createdAt).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </span>
                                    </div>
                                </p>
                            </div>
                        </div>
                    )): <p className="w-full text-sm text-text-secondary flex justify-center items-center px-4 py-4 border border-border rounded-lg">No Clients Found</p>}
                </div>
            )}
            {
                clientModal &&
                (
                    <Modal title={editingClient ? "Edit Client" : "Add Client"} onClose={closeClientModal} width={640}>
                        {apiError && <ErrorMessage message={apiError} variant={"background"} />}
                        <br />
                        <form onSubmit={handleSubmit(handleSubmitForm)} className="grid grid-cols-2 gap-4">
                            <Input
                                label="Name*"
                                {...register("name")}
                                error={errors.name?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="Email*"
                                {...register("email")}
                                error={errors.email?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="Mobile*"
                                {...register("mobile")}
                                showErrorIcon={false}
                                error={errors.mobile?.message}
                            />

                            <Input
                                label="PAN*"
                                {...register("pan")}
                                error={errors.pan?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="GST*"
                                {...register("gst")}
                                error={errors.gst?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="Address*"
                                {...register("address")}
                                error={errors.address?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="City"
                                {...register("city")}
                                error={errors.city?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="State"
                                {...register("state")}
                                error={errors.state?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="Pincode"
                                {...register("pincode")}
                                error={errors.pincode?.message}
                                showErrorIcon={false}
                            />

                            <Input
                                label="Country"
                                {...register("country")}
                                error={errors.country?.message}
                                showErrorIcon={false}
                            />

                            <div className="col-span-2 mt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeClientModal}
                                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" className="!w-auto px-4" loading={isSubmitting}>
                                    {editingClient ? "Update" : "Save"}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )
            }

            {confirmModalOpen?.id && (
                <Modal
                    title="Delete Client"
                    onClose={() => setConfirmModalOpen(false)}
                    width={300}
                >
                    <div className="w-full flex flex-col gap-4">
                        <ErrorMessage message={apiError} />
                        <p>Are you sure you want to delete ?</p>
                        <div className="w-full flex gap-1 items-center justify-end">
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                loading={deleteLoading}
                                disabled={deleteLoading}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
