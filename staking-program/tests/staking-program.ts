import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingProgram } from "../target/types/staking_program";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

describe("staking-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = provider.wallet as anchor.Wallet;
  const connection = new Connection("http://127.0.0.1: 8899", "confirmed");
  const mintKeypair = Keypair.fromSecretKey(new Uint8Array([
    219,  33, 184, 196, 102,   1, 214, 136,  75,  16, 214,
    127,  45,  32, 172, 168, 154,  65,  61, 166, 104, 235,
    235, 246, 204,  86,  86,  40,  29, 174,  85, 210, 255,
     97,  89, 181, 192, 182, 228, 132, 196, 177,  19, 237,
     25,  38,  34,  67, 107, 131,  24,   0, 125, 191, 191,
    242, 107,  10, 130, 168, 215,  62,   2,  13
  ]))

  const program = anchor.workspace.StakingProgram as Program<StakingProgram>;

  async function createMintToken(){
    const mint = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      payer.publicKey,
      9,
      mintKeypair
    )
  }

  it("Is initialized!", async () => {

    // await createMintToken();

    let [vaultAccount] =PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    )

    const tx = await program.methods.initialize()
    .accounts({
      signer: payer.publicKey,
      tokenVaultAccount: vaultAccount,
      mint: mintKeypair.publicKey
    })
    .rpc();
    console.log("Your transaction signature", tx);
  });


  it("stake", async ()=>{

    let userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey
    )

    await mintTo(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      userTokenAccount.address,
      payer.payer,
      1e11
    )

    let [stakeInfo] =PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), payer.publicKey.toBuffer()],
      program.programId
    )
    let [stakeAccount] =PublicKey.findProgramAddressSync(
      [Buffer.from("token"), payer.publicKey.toBuffer()],
      program.programId
    )

    await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey
    )

    const tx = await program.methods
      .stake(new anchor.BN(1)) 
      .signers([payer.payer])
      .accounts({
        stakeAccountInfo: stakeInfo,
        stakeAccount: stakeAccount,
        userTokenAccount: userTokenAccount.address,
        mint: mintKeypair.publicKey,
        signer: payer.publicKey
      })
      .rpc();

      console.log("Your transaction signature", tx);
  })



  it("destake", async ()=>{

    let userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey
    )

    let [stakeInfo] =PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), payer.publicKey.toBuffer()],
      program.programId
    )
    let [stakeAccount] =PublicKey.findProgramAddressSync(
      [Buffer.from("token"), payer.publicKey.toBuffer()],
      program.programId
    )


    let [vaultAccount] =PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    )

    await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey
    )

    const tx = await program.methods
      .destake() 
      .signers([payer.payer])
      .accounts({
        stakeAccount: stakeAccount,
        stakeAccountInfo: stakeInfo,
        userTokenAccount: userTokenAccount.address,
        mint: mintKeypair.publicKey,
        signer: payer.publicKey
      })
      .rpc();

      console.log("Your transaction signature", tx);
  })

});
