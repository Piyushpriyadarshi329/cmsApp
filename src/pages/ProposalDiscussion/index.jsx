import {useEffect, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuCalendar, LuPlus } from "react-icons/lu";
import Button from "../../common/Button/Button";
import Timeline, { TimelineItem } from "../../common/Timeline/Timeline";
import Modal from "../../Modal";
import { useAuth } from "../../context/AuthContext";
import { useClientMembers } from "../../hooks/useClientDetail";
import { useCreateContract } from "../../hooks/useContracts";
import { useProposal } from "../../hooks/useProposals";
import { BILLING_OPTIONS, formatAmount, formatDate, humanize, toDateTimeLocal } from "../../services/utility";

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="text-right font-medium text-text-primary">{value}</dd>
        </div>
    );
}

const DISCUSSION_FIELDS = [
    { label: "Description", key: "description" },
    { label: "Requirement", key: "requirement" },
    { label: "Remarks", key: "remarks" },
];

const CONTRACT_TYPES = [
    { value: "SERVICE", label: "Service" },
    { value: "VENDOR", label: "Vendor" },
    { value: "EMPLOYMENT", label: "Employment" },
    { value: "PARTNERSHIP", label: "Partnership" },
    { value: "NDA", label: "NDA" },
];

const CONTRACT_STATUS = "MANAGER_APPROVAL_PENDING";

function ContractFormModal({ proposalId, defaultTitle, saving, onClose, onSubmit, onSuccess }) {
    const [form, setForm] = useState({
        contractTitle: defaultTitle ?? "",
        contractType: "",
    });

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSubmit({
            contractTitle: form.contractTitle,
            proposalId,
            status: CONTRACT_STATUS,
            contractType: form.contractType,
        });
        if (success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal title="Convert to Contract" onClose={onClose} width={560}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-text-primary">Contract Title</label>
                    <input
                        type="text"
                        required
                        value={form.contractTitle}
                        onChange={handleChange("contractTitle")}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                </div>

                <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-text-primary">Contract Type</label>
                    <select
                        required
                        value={form.contractType}
                        onChange={handleChange("contractType")}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    >
                        <option value="" disabled>
                            Select contract type
                        </option>
                        {CONTRACT_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <p className="text-xs text-text-secondary">
                        Status : <span className="font-medium text-text-primary">{CONTRACT_STATUS}</span>
                    </p>
                </div>

                <div className="col-span-2 mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                    >
                        Cancel
                    </button>
                    <Button type="submit" className="!w-auto px-4" loading={saving}>
                        Create Contract
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

const DISCUSSION_TEXTAREAS = [
    { label: "Description", key: "description", required: true },
    { label: "Requirement", key: "requirement", required: false },
    { label: "Remarks", key: "remarks", required: false },
];

function DiscussionFormModal({
    proposalId,
    clientId,
    tenantUserId,
    clientUserId,
    proposalStartDate,
    latestVersion,
    saving,
    onClose,
    onSubmit,
}) {
    const { members, loading: loadingMembers } = useClientMembers(clientId);
    const [form, setForm] = useState({
        clientUserId: clientUserId ?? "",
        meetingDate: "",
        title: "",
        description: "",
        remarks: "",
        requirement: "",
        termChanged: false,
        // Term fields start from the latest version, so a change is an edit of what is in force today.
        proposalAmount: latestVersion?.proposalAmount ?? "",
        billing: latestVersion?.billing ?? "",
        startDate: toDateTimeLocal(latestVersion?.startDate),
        endDate: toDateTimeLocal(latestVersion?.endDate),
    });

    const handleChange = (field) => (e) => {
        const value = field === "termChanged" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            proposalId,
            clientUserId: Number(form.clientUserId),
            tenantUserId,
            meetingDate: new Date(form.meetingDate).toISOString(),
            title: form.title,
            description: form.description,
            remarks: form.remarks,
            requirement: form.requirement,
            termChanged: form.termChanged,
            createdBy: tenantUserId,
        };

        if (proposalStartDate) {
            payload.proposalStartDate = new Date(proposalStartDate).toISOString();
        }

        if (form.termChanged) {
            payload.proposalAmount = Number(form.proposalAmount);
            payload.billing = form.billing;
            payload.startDate = new Date(form.startDate).toISOString();
            payload.endDate = new Date(form.endDate).toISOString();
        }

        const success = await onSubmit(payload);
        if (success) onClose();
    };

    return (
        <Modal title="Add Discussion" onClose={onClose} width={640}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-text-primary">Title</label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={handleChange("title")}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Meeting Date</label>
                    <input
                        type="datetime-local"
                        required
                        value={form.meetingDate}
                        onChange={handleChange("meetingDate")}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">Client User</label>
                    <select
                        required
                        disabled={loadingMembers}
                        value={form.clientUserId}
                        onChange={handleChange("clientUserId")}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="" disabled>
                            {loadingMembers ? "Loading..." : "Select client user"}
                        </option>
                        {members.map((member) => (
                            <option key={member.id} value={member.id}>
                                {[member.firstname, member.lastname].filter(Boolean).join(" ") || member.email}
                                {member.email ? ` (${member.email})` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {DISCUSSION_TEXTAREAS.map(({ label, key, required }) => (
                    <div key={key} className="col-span-2">
                        <label className="mb-1 block text-sm font-medium text-text-primary">{label}</label>
                        <textarea
                            rows={3}
                            required={required}
                            value={form[key]}
                            onChange={handleChange(key)}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                        />
                    </div>
                ))}

                <label className="col-span-2 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-text-primary">
                    <input
                        type="checkbox"
                        checked={form.termChanged}
                        onChange={handleChange("termChanged")}
                        className="h-4 w-4 accent-primary"
                    />
                    Terms changed in this discussion
                </label>

                {form.termChanged && (
                    <>
                        <div className="col-span-2 -mt-2">
                            <p className="text-xs text-text-secondary">
                                {latestVersion
                                    ? `Pre-filled from version ${latestVersion.proposalVersionNumber}. Saving creates a new version.`
                                    : "No existing version — these values create the first version."}
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-text-primary">
                                Proposal Amount
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.proposalAmount}
                                onChange={handleChange("proposalAmount")}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-text-primary">Billing</label>
                            <select
                                required
                                value={form.billing}
                                onChange={handleChange("billing")}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
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
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-text-primary">Start Date</label>
                            <input
                                type="datetime-local"
                                required
                                value={form.startDate}
                                onChange={handleChange("startDate")}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-text-primary">End Date</label>
                            <input
                                type="datetime-local"
                                required
                                min={form.startDate || undefined}
                                value={form.endDate}
                                onChange={handleChange("endDate")}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                            />
                        </div>
                    </>
                )}

                <div className="col-span-2 mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                    >
                        Cancel
                    </button>
                    <Button type="submit" className="!w-auto px-4" loading={saving}>
                        Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default function ProposalDiscussion() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { proposal, loading, savingDiscussion, addDiscussion } = useProposal(id);
    const [discussionModal, setDiscussionModal] = useState(false);
    const [contractModal, setContractModal] = useState(false);
    const [contractCreated, setContractCreated] = useState(false);
    const { saving: savingContract, createContract } = useCreateContract();

    const discussions = [...(proposal?.discussions ?? [])].sort(
        (a, b) => new Date(a.meetingDate) - new Date(b.meetingDate)
    );
    const versions = [...(proposal?.versions ?? [])].sort(
        (a, b) => (b.proposalVersionNumber ?? 0) - (a.proposalVersionNumber ?? 0)
    );
    const isComplete =
        contractCreated ||
        (proposal?.status || "").toUpperCase() === "COMPLETE";

    return (
        <div>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
                <LuArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">{proposal?.title || "Proposal"}</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        {proposal?.proposalNumber || `Proposal ID: ${id}`}
                    </p>
                </div>
                {!isComplete && user?.role === "SALES" && (
                    <Button className="!w-auto px-4" onClick={() => setContractModal(true)}>
                        Convert to Contract
                    </Button>
                )}
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-text-secondary">Loading proposal...</p>
            ) : !proposal ? (
                <p className="mt-6 text-sm text-text-secondary">Proposal not found.</p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-border lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h2 className="text-sm font-semibold text-text-primary">Discussion</h2>
                            <span className="text-xs text-text-secondary">{discussions.length} entries</span>
                        </div>

                        {discussions.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-text-secondary">
                                No discussion recorded for this proposal.
                            </p>
                        ) : (
                            <Timeline className="px-4 py-5">
                                {discussions.map((entry, idx) => (
                                    <TimelineItem
                                        key={entry.id}
                                        last={idx === discussions.length - 1}
                                        marker={
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-primary-text">
                                                <LuCalendar className="h-3.5 w-3.5" />
                                                {formatDate(entry.meetingDate, true)}
                                            </span>
                                        }
                                    >
                                        <div className="mt-2 rounded-lg border border-border p-4">
                                            <p className="text-sm font-semibold text-text-primary">
                                                {entry.title || "-"}
                                            </p>

                                            <div className="mt-3 flex flex-col gap-2.5">
                                                {DISCUSSION_FIELDS.map(({ label, key }) => (
                                                    <div key={key}>
                                                        <p className="text-xs text-text-secondary">{label}</p>
                                                        <p className="mt-0.5 text-sm text-text-primary">
                                                            {entry[key] || "-"}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-text-secondary">
                                                <span>Tenant User ID : {entry.tenantUserId ?? "-"}</span>
                                                <span>Client User ID : {entry.clientUserId ?? "-"}</span>
                                            </div>
                                        </div>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        )}

                        <div className="flex justify-end border-t border-border px-4 py-3">
                            {
                                proposal?.status === "DRAFT" && user?.role === "SALES"
                                ?
                                <Button
                                    className="!w-auto flex items-center gap-2 !py-2 px-4"
                                    onClick={() => setDiscussionModal(true)}
                                >
                                    <LuPlus className="h-4 w-4" />
                                    Add Discussion
                                </Button>
                                :
                                ''
                            }
                        </div>

                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-border p-4">
                            <h2 className="text-sm font-semibold text-text-primary">Proposal Details</h2>

                            <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                                <Row label="Proposal No" value={proposal.proposalNumber || "-"} />
                                <Row label="Status" value={humanize(proposal.status)} />
                                <Row label="Start Date" value={formatDate(proposal.proposalStartDate)} />
                                <Row label="Tenant" value={proposal.tenant?.name || "-"} />
                            </dl>

                            <div className="mt-4 border-t border-border pt-3">
                                <p className="text-xs text-text-secondary">Description</p>
                                <p className="mt-0.5 text-sm text-text-primary">{proposal.description || "-"}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <h2 className="text-sm font-semibold text-text-primary">Versions</h2>
                                <span className="text-xs text-text-secondary">{versions.length} versions</span>
                            </div>

                            {versions.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-text-secondary">
                                    No versions yet.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3 p-4">
                                    {versions.map((version) => (
                                        <div key={version.id} className="rounded-lg border border-border p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-text">
                                                    v{version.proposalVersionNumber ?? "-"}
                                                </span>
                                                <span className="text-sm font-semibold text-text-primary">
                                                    {formatAmount(version.proposalAmount, version.currency)}
                                                </span>
                                            </div>

                                            <dl className="mt-3 flex flex-col gap-2 text-xs">
                                                <Row label="Billing" value={humanize(version.billing)} />
                                                <Row label="Start" value={formatDate(version.startDate)} />
                                                <Row label="End" value={formatDate(version.endDate)} />
                                            </dl>

                                            <p className="mt-3 border-t border-border pt-2 text-xs text-text-secondary">
                                                Created by {version.createdByName || "-"} on{" "}
                                                {formatDate(version.createdAt)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-border p-4">
                            <h2 className="text-sm font-semibold text-text-primary">Client</h2>

                            <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                                <Row label="Name" value={proposal.client?.name || "-"} />
                                <Row label="Email" value={proposal.client?.email || "-"} />
                                <Row label="Mobile" value={proposal.client?.mobile || "-"} />
                                <Row label="City" value={proposal.client?.city || "-"} />
                            </dl>

                            <div className="mt-4 border-t border-border pt-3">
                                <p className="text-xs text-text-secondary">Contact Person</p>
                                <p className="mt-0.5 text-sm font-medium text-text-primary">
                                    {[proposal.clientUser?.firstname, proposal.clientUser?.lastname]
                                        .filter(Boolean)
                                        .join(" ") || "-"}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {proposal.clientUser?.email || "-"}
                                    {proposal.clientUser?.mobile ? ` · ${proposal.clientUser.mobile}` : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {discussionModal && (
                <DiscussionFormModal
                    proposalId={id}
                    clientId={proposal?.client?.id}
                    tenantUserId={user?.id}
                    clientUserId={proposal?.clientUser?.id}
                    proposalStartDate={proposal?.proposalStartDate}
                    latestVersion={versions[0]}
                    saving={savingDiscussion}
                    onClose={() => setDiscussionModal(false)}
                    onSubmit={addDiscussion}
                />
            )}

            {contractModal && (
                <ContractFormModal
                    proposalId={id}
                    defaultTitle={proposal?.title}
                    saving={savingContract}
                    onClose={() => setContractModal(false)}
                    onSubmit={createContract}
                    onSuccess={() => setContractCreated(true)}
                />
            )}
        </div>
    );
}
