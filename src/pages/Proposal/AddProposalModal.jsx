import { useEffect, useState } from "react";
import Button from "../../common/Button/Button";
import Modal from "../../Modal";
import { useClients } from "../../hooks/useClients";
import { useClientMembers } from "../../hooks/useClientDetail";
import { BILLING_OPTIONS, humanize, toIso } from "../../services/utility";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addProposalSchema } from "../../schema/proposal/addProposalSchema.js";
import Input from "../../common/Input/Input.jsx";
import ErrorMessage from "../../common/Error/ErrorMessage.jsx";

const FORM = {
    title: "",
    description: "",
    clientId: "",
    clientUserId: "",
    proposalStartDate: "",
    proposalAmount: "",
    billing: "",
    startDate: "",
    endDate: "",
};

const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

export default function AddProposalModal({
                                             tenantId,
                                             createdBy,
                                             saving,
                                             onClose,
                                             onSubmit,
                                         }) {
    const { clients, loading: loadingClients } = useClients(tenantId);

    const [apiError, setApiError] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addProposalSchema),
        defaultValues: FORM,
    });

    // Get current client ID from React Hook Form
    const clientId = watch("clientId");

    // Client users depend on selected client
    const {
        members,
        loading: loadingMembers,
    } = useClientMembers(clientId);

    // Reset client user when client changes
    useEffect(() => {
        setValue("clientUserId", "");
    }, [clientId, setValue]);

    const handleFormSubmit = async (form) => {
        setApiError(null);

        const payload = {
            title: form.title,
            description: form.description,
            clientId: Number(form.clientId),
            clientUserId: Number(form.clientUserId),
            proposalStartDate: toIso(form.proposalStartDate),
            proposalAmount: Number(form.proposalAmount),
            billing: form.billing,
            startDate: toIso(form.startDate),
            endDate: toIso(form.endDate),
            createdBy,
            createdAt: new Date().toISOString(),
        };

        const result = await onSubmit(payload);

        if (result?.success) {
            reset(FORM);
            onClose();
            return;
        }

        if (result.error?.errors && Object.keys(result.error.errors).length > 0) {
            const validationErrors = Object.entries(result.error.errors)
                .map(([field, message]) => ({
                    field,
                    message,
                }));

            setApiError(validationErrors);
        } else {
            setApiError(result.error?.message || "Failed to create proposal");
        }
    };

    const formatFieldName = (field) =>
        field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (char) => char.toUpperCase());

    return (
        <Modal title="Add Proposal" onClose={onClose} width={640}>
            {apiError && (
                <div className="col-span-2 space-y-1">
                    {Array.isArray(apiError) ? (
                        apiError.map(({ field, message }) => (
                            <ErrorMessage
                                key={field}
                                message={`${formatFieldName(field)}: ${message}`}
                                variant="background"
                            />
                        ))
                    ) : (
                        <ErrorMessage
                            message={apiError}
                            variant="background"
                        />
                    )}
                </div>
            )}
            <br />
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="grid grid-cols-2 gap-4"
            >
                {/* Title */}
                <Input
                    label="Title*"
                    {...register("title")}
                    error={errors.title?.message}
                    showErrorIcon={false}
                />

                {/* Client */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Client*
                    </label>

                    <select
                        {...register("clientId")}
                        disabled={loadingClients}
                        className={inputClass}
                    >
                        <option value="" disabled>
                            {loadingClients
                                ? "Loading..."
                                : "Select client"}
                        </option>

                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name ||
                                    client.email ||
                                    client.id}
                            </option>
                        ))}
                    </select>

                    {errors.clientId && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.clientId.message}
                        </p>
                    )}
                </div>

                {/* Client User */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Client User*
                    </label>

                    <select
                        {...register("clientUserId")}
                        disabled={!clientId || loadingMembers}
                        className={inputClass}
                    >
                        <option value="" disabled>
                            {!clientId
                                ? "Select a client first"
                                : loadingMembers
                                    ? "Loading..."
                                    : "Select client user"}
                        </option>

                        {members.map((member) => (
                            <option
                                key={member.id}
                                value={member.id}
                            >
                                {[member.firstname, member.lastname]
                                    .filter(Boolean)
                                    .join(" ") || member.email}

                                {member.email
                                    ? ` (${member.email})`
                                    : ""}
                            </option>
                        ))}
                    </select>

                    {errors.clientUserId && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.clientUserId.message}
                        </p>
                    )}
                </div>

                {/* Proposal Start Date */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Proposal Start Date*
                    </label>

                    <input
                        type="date"
                        {...register("proposalStartDate")}
                        className={inputClass}
                    />

                    {errors.proposalStartDate && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.proposalStartDate.message}
                        </p>
                    )}
                </div>

                {/* Proposal Amount */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Proposal Amount*
                    </label>

                    <input
                        type="number"
                        min="0"
                        {...register("proposalAmount")}
                        className={inputClass}
                    />

                    {errors.proposalAmount && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.proposalAmount.message}
                        </p>
                    )}
                </div>

                {/* Billing */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Billing*
                    </label>

                    <select
                        {...register("billing")}
                        className={inputClass}
                    >
                        <option value="" disabled>
                            Select billing
                        </option>

                        {BILLING_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                                {humanize(value)}
                            </option>
                        ))}
                    </select>

                    {errors.billing && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.billing.message}
                        </p>
                    )}
                </div>


                {/* Start Date */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Start Date*
                    </label>

                    <input
                        type="date"
                        {...register("startDate")}
                        className={inputClass}
                    />

                    {errors.startDate && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.startDate.message}
                        </p>
                    )}
                </div>

                {/* End Date */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        End Date*
                    </label>

                    <input
                        type="date"
                        {...register("endDate")}
                        className={inputClass}
                    />

                    {errors.endDate && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.endDate.message}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                        Description*
                    </label>

                    <textarea
                        rows={3}
                        {...register("description")}
                        className={inputClass}
                    />

                    {errors.description && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="col-span-2 mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                    >
                        Cancel
                    </button>

                    <Button
                        type="submit"
                        className="!w-auto px-4"
                        loading={saving}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
}