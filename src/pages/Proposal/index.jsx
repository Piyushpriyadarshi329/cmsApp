import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import InlineTab from "../../common/InlineTab/InlineTab";
import Button from "../../common/Button/Button";
import Loader from "../../common/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { useProposals } from "../../hooks/useProposals";
import { formatDate } from "../../services/utility";
import AddProposalModal from "./AddProposalModal";

const STATUS_TABS = [
    { value: "DRAFT", label: "Draft" },
    { value: "COMPLETE", label: "Completed" },
    { value: "DECLINE", label: "Decline" },
];

const COLUMNS = ["Proposal No", "Title", "Client", "Status", "Start Date"];

export default function Proposal() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const { proposals, loading, saving, addProposal } = useProposals(tenantId);

    const [status, setStatus] = useState(STATUS_TABS[0].value);
    const [proposalModal, setProposalModal] = useState(false);

    const byStatus = (value) =>
        proposals.filter((proposal) => (proposal.status || "").toUpperCase() === value);

    const filteredProposals = byStatus(status);

    const tabs = STATUS_TABS.map(({ value, label }) => ({
        title: `${label} (${byStatus(value).length})`,
        active: status === value,
        onClick: () => setStatus(value),
    }));


    return (
        <div>
            <h1 className="text-xl font-semibold text-text-primary">Proposal</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage your proposals</p>

            <div className="mt-6 flex items-center justify-between gap-4">
                <InlineTab tabs={tabs} />

                <Button
                    className="!w-auto flex items-center gap-2 !py-2 px-4"
                    onClick={() => setProposalModal(true)}
                >
                    <LuPlus className="h-4 w-4" />
                    Add Proposal
                </Button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[700px] text-left text-sm">
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
                        {filteredProposals.map((proposal) => (
                            <tr key={proposal.id} className="border-b border-border last:border-b-0">
                                <td className="whitespace-nowrap px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/proposal-discussion/${proposal.id}`, { state: { proposal } })
                                        }
                                        className="font-medium text-primary-text underline-offset-2 hover:underline"
                                    >
                                        {proposal.proposalNumber || "-"}
                                    </button>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-primary">{proposal.title || "-"}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{proposal.clientName || "-"}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{proposal.status || "-"}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {formatDate(proposal.proposalStartDate)}
                                </td>
                            </tr>
                        ))}
                        {loading && (
                            <tr>
                                <td colSpan={COLUMNS.length}>
                                    <Loader label="Loading proposals..." />
                                </td>
                            </tr>
                        )}
                        {!loading && filteredProposals.length === 0 && (
                            <tr>
                                <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-sm text-text-secondary">
                                    No proposals found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {proposalModal && (
                <AddProposalModal
                    tenantId={tenantId}
                    createdBy={user?.id}
                    saving={saving}
                    onClose={() => setProposalModal(false)}
                    onSubmit={addProposal}
                />
            )}
        </div>
    );
}
