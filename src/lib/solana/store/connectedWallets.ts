import Dexie, { type Table } from 'dexie'
import { isSolanaAddress } from '@/lib/validation/address'

export type ConnectedWalletChain = 'solana'

export interface ConnectedWalletRecord {
  id?: number
  address: string
  nickname: string
  chain: ConnectedWalletChain
  createdAt: number
}

export class ConnectedWalletsDB extends Dexie {
  connected_wallets!: Table<ConnectedWalletRecord, number>

  constructor(name = 'sparkfined-solana') {
    super(name)

    this.version(1).stores({
      connected_wallets: '++id, address, chain, createdAt',
    })
  }
}

export const connectedWalletsDB = new ConnectedWalletsDB()

function normalizeNickname(nickname?: string): string {
  const trimmed = nickname?.trim()
  if (!trimmed) return 'Trading Wallet'
  return trimmed
}

function sanitizeAddress(address: string): string {
  const trimmed = address.trim()
  if (trimmed.startsWith('0x')) {
    throw new Error('EVM addresses are not supported. Please enter a Solana address.')
  }

  if (!isSolanaAddress(trimmed)) {
    throw new Error('Invalid Solana address. Use a Base58 address between 32-44 characters.')
  }

  return trimmed
}

export async function getConnectedWallets(db: ConnectedWalletsDB = connectedWalletsDB) {
  return db.connected_wallets.orderBy('createdAt').reverse().toArray()
}

export async function addConnectedWallet(
  input: { address: string; nickname?: string },
  db: ConnectedWalletsDB = connectedWalletsDB,
): Promise<ConnectedWalletRecord> {
  const address = sanitizeAddress(input.address)
  const nickname = normalizeNickname(input.nickname)

  const existing = await db.connected_wallets.where('address').equals(address).first()
  if (existing) {
    throw new Error('Wallet is already connected.')
  }

  const record: ConnectedWalletRecord = {
    address,
    nickname,
    chain: 'solana',
    createdAt: Date.now(),
  }

  const id = await db.connected_wallets.add(record)
  return { ...record, id }
}

export async function removeConnectedWallet(id: number, db: ConnectedWalletsDB = connectedWalletsDB) {
  await db.connected_wallets.delete(id)
}

export async function resetConnectedWallets(db: ConnectedWalletsDB = connectedWalletsDB) {
  await db.connected_wallets.clear()
}
