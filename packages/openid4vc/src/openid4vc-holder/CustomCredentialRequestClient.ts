import {
  CredentialRequestClient,
  CredentialRequestClientBuilder,
  ProofOfPossessionBuilder,
} from '@sphereon/oid4vci-client'
import {
  CredentialResponse,
  OID4VCICredentialFormat,
  OpenIDResponse,
  OpenId4VCIVersion,
  ProofOfPossession,
} from '@sphereon/oid4vci-common'
import { CredentialFormat } from '@sphereon/ssi-types'

export class CustomCredentialRequestClient extends CredentialRequestClient {
  private readonly _customData: any

  constructor(builder: CredentialRequestClientBuilder, customData?: any) {
    super(builder)
    this._customData = customData
  }

  public async acquireCredentialsUsingProof<DIDDoc>(opts: {
    proofInput: ProofOfPossessionBuilder<DIDDoc> | ProofOfPossession
    credentialTypes?: string | string[]
    format?: CredentialFormat | OID4VCICredentialFormat
  }): Promise<OpenIDResponse<CredentialResponse>> {
    const { credentialTypes, proofInput, format } = opts

    const request = await this.createCredentialRequest({
      proofInput,
      credentialTypes,
      format,
      version: this.getVersion(),
    })

    // @ts-expect-error
    request.customData = this._customData

    return await this.acquireCredentialsUsingRequest(request)
  }

  private getVersion(): OpenId4VCIVersion {
    return (this as any).credentialRequestOpts.version ?? OpenId4VCIVersion.VER_1_0_11
  }
}
