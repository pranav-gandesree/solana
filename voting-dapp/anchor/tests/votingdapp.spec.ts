import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'

describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Votingdapp as Program<Votingdapp>

  const votingdappKeypair = Keypair.generate()

  it('Initialize Votingdapp', async () => {
   
    
  })

})
