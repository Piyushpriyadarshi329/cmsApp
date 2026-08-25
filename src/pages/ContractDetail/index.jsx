import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { LuArrowLeft, LuCalendar, LuExternalLink, LuSignature } from "react-icons/lu";
import Button from "../../common/Button/Button";
import Loader from "../../common/Loader/Loader";
import Timeline, { TimelineItem } from "../../common/Timeline/Timeline";
import { useAuth } from "../../context/AuthContext";
import { useContract, useESign, contractId } from "../../hooks/useContracts";
import ESignModal from "../ESign/ESignModal";
import { formatAmount, formatDate, humanize } from "../../services/utility";
import Modal from "../../Modal/index.jsx";
import ErrorMessage from "../../common/Error/ErrorMessage.jsx";

// Each pending status is actionable by exactly one role, per the backend Role enum,
// and each role approves through its own endpoint.
const PENDING_SIGNATURE = "ESIGN_PENDING";

const APPROVAL_STAGE_BY_STATUS = {
    MANAGER_APPROVAL_PENDING: { role: "MANAGER", action: "manager-approve" },
    FINANCE_APPROVAL_PENDING: { role: "FINANCE", action: "finance-approve" },
    LEGAL_APPROVAL_PENDING: { role: "LEGAL", action: "legal-approve" },
};

const TENANT_FIELDS = [
    { label: "Legal Name", key: "legalName" },
    { label: "Email", key: "email" },
    { label: "Mobile", key: "mobile" },
    { label: "City", key: "city" },
    { label: "State", key: "state" },
    { label: "Pincode", key: "pinCode" },
    { label: "Country", key: "country" },
    { label: "Address", key: "address", span: true },
];

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="text-right font-medium text-text-primary">{value}</dd>
        </div>
    );
}

export default function ContractDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { contract, loading, acting, runAction, refresh } = useContract(id);
    const { signing, signContract } = useESign();
    const [signModal, setSignModal] = useState(false);
    const [confirmRevert, setConfirmRevert] = useState(false);
    const [apiError, setApiError] = useState(false);

    const proposal = contract?.proposal;
    const tenant = contract?.tenant ?? proposal?.tenant;
    const clientName = proposal?.clientName ?? proposal?.client?.name;
    const discussions = [...(proposal?.discussions ?? proposal?.proposalDiscussion ?? [])].sort(
        (a, b) => new Date(a.meetingDate) - new Date(b.meetingDate)
    );
    const versions = [...(contract?.proposalVersions ?? proposal?.versions ?? [])].sort(
        (a, b) => (b.proposalVersionNumber ?? 0) - (a.proposalVersionNumber ?? 0)
    );
    const timeline = [...(contract?.timeLine ?? [])].sort(
        (a, b) => a.actionTime - b.actionTime
    );
    const stage = APPROVAL_STAGE_BY_STATUS[(contract?.status || "").toUpperCase()];
    const canAct = !!stage && !!user?.role && stage.role === user.role.toUpperCase();
    const canSign = (contract?.status || "").toUpperCase() === PENDING_SIGNATURE;

    const handleRevert = async () => {
        try {
            setApiError(null);

            const success = await runAction("revert");

            if (success) {
                setConfirmRevert(false);
            }
        } catch (error) {
            console.error("Revert failed:", error);

            setApiError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to revert contract. Please try again."
            );
        }
    };

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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">
                        {contract?.contractTitle || "Contract"}
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        {contract ? `Contract ID: ${contractId(contract)}` : `Contract ID: ${id}`}
                    </p>
                </div>

                {canSign && user?.role === "LEGAL" && (
                    <button
                        type="button"
                        onClick={() => setSignModal(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                    >
                        <LuSignature className="h-4 w-4" />
                        E-Sign
                    </button>
                )}

                {canAct && (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setApiError(null);
                                setConfirmRevert(true);
                            }}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Revert to Proposal
                        </button>
                        <Button
                            className="!w-auto px-4"
                            loading={acting === stage.action}
                            disabled={!!acting}
                            onClick={() => runAction(stage.action)}
                        >
                            Approve
                        </Button>
                    </div>
                )}
            </div>

            {loading ? (
                <Loader label="Loading contract..." />
            ) : !contract ? (
                <p className="mt-6 text-sm text-text-secondary">Contract not found.</p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <div className="rounded-xl border border-border p-4">
                            <h2 className="text-sm font-semibold text-text-primary">Contract</h2>
                            <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                                <Row label="Title" value={contract.contractTitle || "-"} />
                                <Row label="Status" value={humanize(contract.status)} />
                                <Row label="Contract Type" value={humanize(contract.contractType)} />
                                <Row
                                    label="Amount"
                                    value={formatAmount(contract.proposalAmount, contract.currency)}
                                />
                                <Row
                                    label="Billing"
                                    value={humanize(contract.billing ?? contract.billingType)}
                                />
                                <Row label="Start Date" value={formatDate(contract.startDate)} />
                                <Row label="End Date" value={formatDate(contract.endDate)} />
                                <Row
                                    label="Proposal Version"
                                    value={
                                        contract.proposalVersionNumber
                                            ? `v${contract.proposalVersionNumber}`
                                            : "-"
                                    }
                                />
                            </dl>
                        </div>

                        <div className="rounded-xl border border-border p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-text-primary">Linked Proposal</h2>
                                {proposal && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/proposal-discussion/${proposal.id}`, { state: { proposal } })
                                        }
                                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-primary-light"
                                    >
                                        <LuExternalLink className="h-3.5 w-3.5" />
                                        Open Proposal
                                    </button>
                                )}
                            </div>

                            {!proposal ? (
                                <p className="mt-3 text-sm text-text-secondary">No proposal linked.</p>
                            ) : (
                                <>
                                    <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                                        <Row label="Proposal No" value={proposal.proposalNumber || "-"} />
                                        <Row label="Title" value={proposal.title || "-"} />
                                        <Row label="Client" value={clientName || "-"} />
                                        <Row label="Status" value={humanize(proposal.status)} />
                                        <Row label="Start Date" value={formatDate(proposal.proposalStartDate)} />
                                    </dl>

                                    <div className="mt-4 border-t border-border pt-3">
                                        <p className="text-xs text-text-secondary">Description</p>
                                        <p className="mt-0.5 text-sm text-text-primary">
                                            {proposal.description || "-"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {versions.length > 0 && (
                            <div className="rounded-xl border border-border">
                                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                    <h2 className="text-sm font-semibold text-text-primary">Proposal Versions</h2>
                                    <span className="text-xs text-text-secondary">{versions.length} versions</span>
                                </div>

                                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                                    {versions.map((version) => (
                                        <div
                                            key={version.id}
                                            className={
                                                version.proposalVersionNumber === contract.proposalVersionNumber
                                                    ? "rounded-lg border border-primary p-3"
                                                    : "rounded-lg border border-border p-3"
                                            }
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-2">
                                                    <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-text">
                                                        v{version.proposalVersionNumber ?? "-"}
                                                    </span>
                                                    {version.proposalVersionNumber ===
                                                        contract.proposalVersionNumber && (
                                                        <span className="text-xs font-medium text-primary-text">
                                                            On contract
                                                        </span>
                                                    )}
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
                            </div>
                        )}

                        <div className="rounded-xl border border-border">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <h2 className="text-sm font-semibold text-text-primary">Discussion</h2>
                                <span className="text-xs text-text-secondary">{discussions.length} entries</span>
                            </div>

                            {discussions.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-text-secondary">
                                    No discussion recorded for the linked proposal.
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
                                                <p className="mt-2 text-sm text-text-primary">
                                                    {entry.description || "-"}
                                                </p>
                                            </div>
                                        </TimelineItem>
                                    ))}
                                </Timeline>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-border">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <h2 className="text-sm font-semibold text-text-primary">Contract Timeline</h2>
                                <span className="text-xs text-text-secondary">{timeline.length} events</span>
                            </div>

                            {timeline.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-text-secondary">
                                    No timeline events yet.
                                </p>
                            ) : (
                                <Timeline className="px-4 py-5">
                                    {timeline.map((entry, idx) => (
                                        <TimelineItem
                                            key={`${entry.action}-${entry.actionAt}-${idx}`}
                                            last={idx === timeline.length - 1}
                                            marker={
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-primary-text">
                                                    <LuCalendar className="h-3.5 w-3.5" />
                                                    {formatDate(
                                                        new Date(entry.actionTime).toISOString(),
                                                        true
                                                    )}
                                                </span>
                                            }
                                        >
                                            <div className="mt-2 rounded-lg border border-border p-3">
                                                <p className="text-sm font-semibold text-text-primary">
                                                    {entry.name || humanize(entry.type)}
                                                </p>

                                                <p className="mt-1 text-xs text-text-secondary">
                                                    {entry.owner?.ownerName || "-"}
                                                </p>

                                                {entry.email && (
                                                    <p className="truncate text-xs text-text-secondary">
                                                        {entry.email}
                                                    </p>
                                                )}

                                                {entry.status && (
                                                    <span className="mt-2 inline-block rounded-full bg-primary-light px-2 py-1 text-xs font-medium text-primary-text">
                                {humanize(entry.status)}
                            </span>
                                                )}
                                            </div>
                                        </TimelineItem>
                                    ))}
                                </Timeline>
                            )}
                        </div>

                        <div className="rounded-xl border border-border p-4">
                            <h2 className="text-sm font-semibold text-text-primary">Tenant</h2>

                        {!tenant ? (
                            <p className="mt-3 text-sm text-text-secondary">No tenant details.</p>
                        ) : (
                            <>
                                <div className="mt-3 flex items-center gap-3">
                                    {tenant.logoUrl ? (
                                        <img
                                            src={tenant.logoUrl}
                                            alt={tenant.name || "Tenant logo"}
                                            className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-text">
                                            {(tenant.name ?? "?").charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-text-primary">
                                            {tenant.name || "-"}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {tenant.verified ? "Verified" : "Not verified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                                    {TENANT_FIELDS.map(({ label, key, span }) => (
                                        <div key={key} className={span ? "col-span-2" : undefined}>
                                            <p className="text-xs text-text-secondary">{label}</p>
                                            <p className="mt-0.5 text-sm font-medium text-text-primary">
                                                {tenant[key] || "-"}
                                            </p>
                                        </div>
                                    ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {signModal && (
                <ESignModal
                    contract={contract}
                    signing={signing}
                    onClose={() => setSignModal(false)}
                    onSubmit={async (payload) => {
                        const success = await signContract(id, payload);
                        if (success) {
                            setSignModal(false);
                            await refresh();
                        }
                        return success;
                    }}
                />
            )}


            {
                confirmRevert
                &&
                <Modal title="Revert to Proposal" onClose={() => setConfirmRevert(false)} width={300}>
                    <div className="w-full flex flex-col gap-4">
                        <ErrorMessage variant="background" message={apiError} />
                        <p>Are you sure you want to revert ?</p>
                        <div className="w-full flex gap-1 items-center justify-end">
                            <Button
                                variant="primary"
                                onClick={handleRevert}
                                loading={acting === "revert"}
                                disabled={!!acting}
                            >
                                Revert
                            </Button>
                        </div>
                    </div>
                </Modal>
            }
        </div>
    );
}
