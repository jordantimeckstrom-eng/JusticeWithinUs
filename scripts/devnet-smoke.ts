import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TempleDao as Program<any>;
  const wallet = provider.wallet;

  const [daoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao")],
    program.programId
  );

  // Initialize DAO once.
  try {
    const sig = await program.methods
      .initializeDao()
      .accounts({
        dao: daoPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("initializeDao:", sig);
  } catch (e) {
    console.log("initializeDao skipped (likely already initialized):", (e as Error).message);
  }

  const dao = await program.account.dao.fetch(daoPda);
  const proposalId = new BN(dao.proposalCount);

  const [proposalPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), proposalId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const proposeSig = await program.methods
    .propose("Temple smoke test proposal", new BN(10))
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      proposer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("propose:", proposeSig);

  const [voteRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposalPda.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const voteSig = await program.methods
    .vote(true, new BN(10))
    .accounts({
      proposal: proposalPda,
      voteRecord: voteRecordPda,
      voter: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("vote:", voteSig);

  console.log(
    "Vote recorded. Wait until voting period ends before calling enact() for this proposal."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
