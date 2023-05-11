import type { Key, KeyPair, KeyType } from '../crypto'
import type { EncryptedMessage, PlaintextMessage, EnvelopeType } from '../didcomm/types'
import type { Disposable } from '../plugins'
import type { WalletConfig, WalletConfigRekey, WalletExportImportConfig } from '../types'
import type { Buffer } from '../utils/buffer'

export interface Wallet extends Disposable {
  isInitialized: boolean
  isProvisioned: boolean

  create(walletConfig: WalletConfig): Promise<void>
  createAndOpen(walletConfig: WalletConfig): Promise<void>
  open(walletConfig: WalletConfig): Promise<void>
  rotateKey(walletConfig: WalletConfigRekey): Promise<void>
  retrieveKeyPair(kid: string): Promise<KeyPair>
  close(): Promise<void>
  delete(): Promise<void>

  /**
   * Export the wallet to a file at the given path and encrypt it with the given key.
   *
   * @throws {WalletExportPathExistsError} When the export path already exists
   */
  export(exportConfig: WalletExportImportConfig): Promise<void>
  import(walletConfig: WalletConfig, importConfig: WalletExportImportConfig): Promise<void>

  /**
   * Create a key with an optional private key and keyType.
   *
   * @param options.privateKey Buffer Private key (formerly called 'seed')
   * @param options.keyType KeyType the type of key that should be created
   *
   * @returns a `Key` instance
   *
   * @throws {WalletError} When an unsupported keytype is requested
   * @throws {WalletError} When the key could not be created
   * @throws {WalletKeyExistsError} When the key already exists in the wallet
   */
  createKey(options: WalletCreateKeyOptions): Promise<Key>
  sign(options: WalletSignOptions): Promise<Buffer>
  verify(options: WalletVerifyOptions): Promise<boolean>

  pack(payload: Record<string, unknown>, params: WalletPackOptions): Promise<EncryptedMessage>
  unpack(encryptedMessage: EncryptedMessage): Promise<UnpackedMessageContext>
  generateNonce(): Promise<string>
  generateWalletKey(): Promise<string>
}

export interface WalletCreateKeyOptions {
  keyType: KeyType
  seed?: Buffer
  privateKey?: Buffer
}

export interface WalletSignOptions {
  data: Buffer | Buffer[]
  key: Key
}

export interface WalletVerifyOptions {
  data: Buffer | Buffer[]
  key: Key
  signature: Buffer
}

export interface UnpackedMessageContext {
  plaintextMessage: PlaintextMessage
  senderKey?: string
  recipientKey?: string
}

export interface WalletPackV1Options {
  version: 'v1'
  recipientKeys: string[]
  senderKey: string | null
  envelopeType?: EnvelopeType
}
export interface WalletPackV2Options {
  version: 'v2'
  toDid?: string
  fromDid?: string
  serviceId?: string
  envelopeType?: EnvelopeType
}

export type WalletPackOptions = WalletPackV1Options | WalletPackV2Options
