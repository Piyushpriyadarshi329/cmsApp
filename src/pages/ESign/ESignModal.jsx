import { useState } from "react";
import Button from "../../common/Button/Button";
import FileUpload from "../../common/FileUpload/FileUpload";
import Modal from "../../Modal";
import ErrorMessage from "../../common/Error/ErrorMessage";

export default function ESignModal({ contract, signing, onClose, onSubmit, otpRequired=false }) {
    const [signature, setSignature] = useState(null);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!signature) {
            setError("Please upload your signature");
            return;
        }
        setError("");
        const success = await onSubmit({
            signatureKey: signature.objectKey,
            signatureFileName: signature.name,
            otp,
        });
        if (!success) setError("Signing failed. Check the OTP and try again.");
    };

    return (
        <Modal title="E-Sign Contract" onClose={onClose} width={520}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="rounded-xl bg-primary-light p-4">
                    <p className="text-sm font-semibold text-text-primary">
                        {contract?.contractTitle || "Contract"}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                        {contract?.proposal?.proposalNumber || "-"}
                    </p>
                </div>

                <div>
                    <FileUpload
                        id="e-sign-signature"
                        label="Upload Signature"
                        accept="image/*"
                        disabled={signing}
                        onUploadStart={() => setError("")}
                        onUploadComplete={({ objectKey, file }) =>
                            setSignature({ objectKey, name: file.name })
                        }
                        onUploadError={() => setSignature(null)}
                    />
                    {signature && (
                        <p className="mt-1 text-xs text-text-secondary">
                            Signature attached : {signature.name}
                        </p>
                    )}
                </div>

                {
                    otpRequired
                    &&
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text-primary">OTP</label>
                        <input
                            type="text"
                            required
                            inputMode="numeric"
                            pattern="^[0-9]{4,8}$"
                            title="Enter the 4-8 digit OTP"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                        />
                    </div>
                }

                {error && <ErrorMessage variant="background" message={error} />}

                <div className="mt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary-light"
                    >
                        Cancel
                    </button>
                    <Button type="submit" className="!w-auto px-4" loading={signing}>
                        Sign
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
