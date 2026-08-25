import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSignature } from "react-icons/lu";
import InlineTab from "../../common/InlineTab/InlineTab";
import Loader from "../../common/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { useContracts, useESign, contractId } from "../../hooks/useContracts";
import { formatAmount, formatDate, humanize } from "../../services/utility";
import ESignModal from "./ESignModal";

// Each e-sign tab is a contract status coming off the same contract API.
const ESIGN_TABS = [
    { value: "ESIGN_PENDING", label: "Pending My Signature" },
    { value: "PARTIALLY_SIGNED", label: "Client Requested" },
    { value: "ACTIVE", label: "Completed" },
];

const COLUMNS = ["Contract", "Proposal No", "Client", "Contract Type", "Amount", "Start Date", "Status", "Action"];

const PENDING_SIGNATURE = "ESIGN_PENDING";

export default function ESign() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const { contracts, loading, reload } = useContracts(tenantId);
    const { signing, signContract } = useESign();

    const [status, setStatus] = useState(ESIGN_TABS[0].value);
    const [signContractItem, setSignContractItem] = useState(null);

    const byStatus = (value) =>
        contracts.filter((contract) => (contract.status || "").toUpperCase() === value);

    const filteredContracts = byStatus(status);

    const tabs = ESIGN_TABS.map(({ value, label }) => ({
        title: `${label} (${byStatus(value).length})`,
        active: status === value,
        onClick: () => setStatus(value),
    }));

    return (
        <div>
            <h1 className="text-xl font-semibold text-text-primary">E-Sign</h1>
            <p className="mt-1 text-sm text-text-secondary">Track contracts through signature</p>

            <div className="mt-6">
                <InlineTab tabs={tabs} />
            </div>

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
                        {filteredContracts.map((contract) => (
                            <tr key={contractId(contract)} className="border-b border-border last:border-b-0">
                                <td className="whitespace-nowrap px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/e-sign/${contractId(contract)}`)}
                                        className="font-medium text-primary-text underline-offset-2 hover:underline"
                                    >
                                        {contract.contractTitle || "-"}
                                    </button>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {contract.proposal?.proposalNumber || "-"}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {contract.proposal?.clientName ?? contract.proposal?.client?.name ?? "-"}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {humanize(contract.contractType)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {formatAmount(contract.proposalAmount, contract.currency)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {formatDate(contract.startDate)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {humanize(contract.status)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    {(contract.status || "").toUpperCase() === PENDING_SIGNATURE ? (
                                        <button
                                            type="button"
                                            onClick={() => setSignContractItem(contract)}
                                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-primary-light"
                                        >
                                            <LuSignature className="h-3.5 w-3.5" />
                                            E-Sign
                                        </button>
                                    ) : (
                                        <span className="text-xs text-text-secondary">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {loading && (
                            <tr>
                                <td colSpan={COLUMNS.length}>
                                    <Loader label="Loading contracts..." />
                                </td>
                            </tr>
                        )}
                        {!loading && filteredContracts.length === 0 && (
                            <tr>
                                <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-sm text-text-secondary">
                                    No contracts found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {signContractItem && (
                <ESignModal
                    contract={signContractItem}
                    signing={signing}
                    onClose={() => setSignContractItem(null)}
                    onSubmit={async (payload) => {
                        const success = await signContract(contractId(signContractItem), payload);
                        if (success) {
                            setSignContractItem(null);
                            reload();
                        }
                        return success;
                    }}
                />
            )}
        </div>
    );
}
