import {
  Connection, PublicKey, Transaction,
  SystemProgram, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress, createTransferInstruction,
  TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const TREASURY = "CKvxY6AcdFo9LBL2YV6pqUyCTx3psTyiFiqqSCbMF1bV";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SAI_MINT  = "GWXCNDwhKy7g2TDbp8Vb64Dgs8LKrabT1N6RCRN7brrr";

export type PaymentToken = "sol" | "usdc" | "sai";

// Build a payment transaction (not signed yet)
export async function buildPaymentTx(
  connection:  Connection,
  from:        string,
  token:       PaymentToken,
  amount:      number,          // in human units: SOL / USDC / SAI
): Promise<Transaction> {
  const fromPk     = new PublicKey(from);
  const treasuryPk = new PublicKey(TREASURY);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: fromPk });

  if (token === "sol") {
    tx.add(SystemProgram.transfer({
      fromPubkey: fromPk,
      toPubkey:   treasuryPk,
      lamports:   Math.round(amount * LAMPORTS_PER_SOL),
    }));
  } else {
    const mintPk = new PublicKey(token === "usdc" ? USDC_MINT : SAI_MINT);
    const decimals = token === "usdc" ? 6 : 6; // both USDC and SAI use 6 decimals
    const rawAmount = BigInt(Math.round(amount * 10 ** decimals));

    const fromAta     = await getAssociatedTokenAddress(mintPk, fromPk);
    const treasuryAta = await getAssociatedTokenAddress(mintPk, treasuryPk);

    tx.add(createTransferInstruction(
      fromAta,
      treasuryAta,
      fromPk,
      rawAmount,
      [],
      TOKEN_PROGRAM_ID,
    ));
  }

  return tx;
}

// Confirm a transaction was finalized on-chain
export async function confirmTx(
  connection: Connection,
  signature:  string,
): Promise<boolean> {
  try {
    const result = await connection.confirmTransaction(signature, "confirmed");
    return !result.value.err;
  } catch {
    return false;
  }
}

// Verify a payment on-chain: check tx was confirmed and sent to treasury
export async function verifyPaymentTx(
  connection: Connection,
  signature:  string,
  from:       string,
  token:      PaymentToken,
  expectedAmount: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      commitment:                 "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!tx || tx.meta?.err) return { ok: false, error: "Transaction failed or not found" };

    // Check the tx is recent (within 10 minutes)
    const blockTime = tx.blockTime ?? 0;
    if (Date.now() / 1000 - blockTime > 600) {
      return { ok: false, error: "Transaction too old" };
    }

    if (token === "sol") {
      const treasuryPk = TREASURY;
      const postBals   = tx.meta?.postBalances ?? [];
      const preBals    = tx.meta?.preBalances  ?? [];
      const accounts   = tx.transaction.message.accountKeys;

      const treasuryIdx = accounts.findIndex(k =>
        (typeof k === "object" && "pubkey" in k ? k.pubkey : k).toString() === treasuryPk
      );
      if (treasuryIdx < 0) return { ok: false, error: "Treasury not in tx" };

      const received = (postBals[treasuryIdx] - preBals[treasuryIdx]) / LAMPORTS_PER_SOL;
      if (received < expectedAmount * 0.99) {
        return { ok: false, error: `Received ${received} SOL, expected ${expectedAmount}` };
      }
    } else {
      // SPL token: check inner instructions for transfer to treasury ATA
      // Simplified: verify the tx is confirmed and involves treasury
      const meta = tx.meta;
      const postTokenBals = meta?.postTokenBalances ?? [];
      const preTokenBals  = meta?.preTokenBalances  ?? [];
      const mintAddr = token === "usdc" ? USDC_MINT : SAI_MINT;

      const treasuryPost = postTokenBals.find(
        b => b.owner === TREASURY && b.mint === mintAddr
      );
      const treasuryPre  = preTokenBals.find(
        b => b.owner === TREASURY && b.mint === mintAddr
      );

      const postAmt = parseFloat(treasuryPost?.uiTokenAmount?.uiAmountString ?? "0");
      const preAmt  = parseFloat(treasuryPre?.uiTokenAmount?.uiAmountString  ?? "0");
      const received = postAmt - preAmt;

      if (received < expectedAmount * 0.99) {
        return { ok: false, error: `Token received ${received}, expected ${expectedAmount}` };
      }
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Verification error" };
  }
}
