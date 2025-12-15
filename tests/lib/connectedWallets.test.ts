import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  ConnectedWalletsDB,
  addConnectedWallet,
  getConnectedWallets,
  removeConnectedWallet,
} from '@/lib/solana/store/connectedWallets'
import { WELL_KNOWN_ADDRESSES } from '@/lib/validation/address'

const createDb = () => new ConnectedWalletsDB(`solana-wallets-${Date.now()}-${Math.random()}`)

describe('connectedWallets store', () => {
  let db: ConnectedWalletsDB

  beforeEach(() => {
    db = createDb()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('stores Solana wallets with default chain metadata', async () => {
    const added = await addConnectedWallet(
      { address: WELL_KNOWN_ADDRESSES.SOL, nickname: 'Primary' },
      db,
    )

    const wallets = await getConnectedWallets(db)
    expect(wallets).toHaveLength(1)
    expect(wallets[0]?.chain).toBe('solana')
    expect(wallets[0]?.nickname).toBe('Primary')
    expect(wallets[0]?.address).toBe(added.address)
  })

  it('rejects invalid or duplicate addresses', async () => {
    await expect(addConnectedWallet({ address: '0x1234', nickname: 'evm' }, db)).rejects.toThrow(
      /Solana address/i,
    )

    await addConnectedWallet({ address: WELL_KNOWN_ADDRESSES.USDC, nickname: 'quote' }, db)
    await expect(addConnectedWallet({ address: WELL_KNOWN_ADDRESSES.USDC }, db)).rejects.toThrow(
      /already connected/i,
    )
  })

  it('removes wallets by id', async () => {
    const added = await addConnectedWallet({ address: WELL_KNOWN_ADDRESSES.USDT, nickname: 'temp' }, db)

    await removeConnectedWallet(added.id!, db)
    const wallets = await getConnectedWallets(db)

    expect(wallets).toHaveLength(0)
  })
})
