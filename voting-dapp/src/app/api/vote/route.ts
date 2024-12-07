import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp";
import { BN, Program } from "@coral-xyz/anchor";

export const OPTIONS = GET;

const IDL = require("@/../anchor/target/idl/votingdapp.json")

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://imgs.search.brave.com/rsnzDqt5xrq_UvxAls4bqhC5Mui2C6RydFDv4KWaQMc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzI2L2Ni/Lzg0LzI2Y2I4NGVi/ODY5Yjg2MzhjNzE5/ZTI1NzU2MGZhYTI2/LmpwZw",
    title: "which team will win the ipl 2025",
    description: "RCB or MI ",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for RCB",
          href: "/api/vote?team=RCB",
          type: "transaction"
        },
        {
          label: "Vote for MI",
          href: "/api/vote?team=MI",
          type: "transaction"
        }
      ]
    }
  };
  return Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS});
}


export async function POST(request:Request) {
  const url = new URL(request.url)
  const team = url.searchParams.get("team");

  if(team !="RCB" && team != "MI"){
    return new Response("Invalid response", {status : 400, headers: ACTIONS_CORS_HEADERS})
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Votingdapp> = new Program(IDL, {connection});

  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);  
  } catch (error) {
    return new Response("Invalid Account", {status: 400, headers: ACTIONS_CORS_HEADERS})
  }

  const instruction = await program.methods
    .vote(team, new BN(1))
    .accounts({
      payer: voter,
    })
    .instruction()
  
  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    },
  });
  
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}