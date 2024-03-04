import type { OpenId4VciCredentialSupported, OpenId4VciCredentialSupportedWithId } from './models'
import type { AuthorizationDetails, CredentialOfferFormat, EndpointMetadataResult } from '@sphereon/oid4vci-common'

import { CredoError } from '@credo-ts/core'

/**
 * Get all `types` from a `CredentialSupported` object.
 *
 * Depending on the format, the types may be nested, or have different a different name/type
 */
export function getTypesFromCredentialSupported(credentialSupported: OpenId4VciCredentialSupported) {
  if (
    credentialSupported.format === 'jwt_vc_json-ld' ||
    credentialSupported.format === 'ldp_vc' ||
    credentialSupported.format === 'jwt_vc_json' ||
    credentialSupported.format === 'jwt_vc'
  ) {
    return credentialSupported.types
  } else if (credentialSupported.format === 'vc+sd-jwt') {
    return [credentialSupported.vct]
  }

  throw Error(`Unable to extract types from credentials supported. Unknown format ${credentialSupported.format}`)
}

/**
 * Returns all entries from the credential offer with the associated metadata resolved. For 'id' entries, the associated `credentials_supported` object is resolved from the issuer metadata.
 * For inline entries, an error is thrown.
 */
export function getOfferedCredentials(
  offeredCredentials: Array<string | CredentialOfferFormat>,
  allCredentialsSupported: OpenId4VciCredentialSupported[]
): OpenId4VciCredentialSupportedWithId[] {
  const credentialsSupported: OpenId4VciCredentialSupportedWithId[] = []

  for (let offeredCredential of offeredCredentials) {
    // In draft 12 inline credential offers are removed. It's easier to already remove support now.

    // 666 - disabled error
    // throw new CredoError(
    //   'Only referenced credentials pointing to an id in credentials_supported issuer metadata are supported'
    // )

    // Note: ???
    // 666 - TODO: find a better way of getting the id from the walt.id credential offer format
    if (typeof offeredCredential !== 'string') {
      // @ts-ignore
      const types: string[] = offeredCredential.types

      if (types[1] !== 'UniversityDegreeCredential') {
        offeredCredential = types[1]
      } else {
        console.log({ types })
        if (types[2] === undefined) {
          offeredCredential = 'UniversityDegree'
        } else if (types[2] === 'vc+sd-jwt') {
          return [
            {
              format: 'vc+sd-jwt',
              id: 'UniversityDegreeCredential-sdjwt',
              cryptographic_binding_methods_supported: ['did'],
              cryptographic_suites_supported: ['EdDSA', 'ES256', 'ES256K', 'RSA'],
              // @ts-ignore
              types: ['VerifiableCredential', 'UniversityDegreeCredential'],
            },
          ]
        }
      }
    }

    const foundSupportedCredential = allCredentialsSupported.find(
      (supportedCredential): supportedCredential is OpenId4VciCredentialSupportedWithId =>
        supportedCredential.id !== undefined && supportedCredential.id === offeredCredential
    )

    console.log({
      foundSupportedCredential,
      allCredentialsSupported: JSON.stringify(allCredentialsSupported),
      offeredCredential: JSON.stringify(offeredCredential), // 666 - disabled error
    })

    // Make sure the issuer metadata includes the offered credential.
    if (!foundSupportedCredential) {
      throw new Error(
        `Offered credential '${offeredCredential}' is not part of credentials_supported of the issuer metadata.`
      )
    }

    credentialsSupported.push(foundSupportedCredential)
  }

  return credentialsSupported
}

// copied from sphereon as the method is only available on the client
export function handleAuthorizationDetails(
  authorizationDetails: AuthorizationDetails | AuthorizationDetails[],
  metadata: EndpointMetadataResult
): AuthorizationDetails | AuthorizationDetails[] | undefined {
  if (Array.isArray(authorizationDetails)) {
    return authorizationDetails.map((value) => handleLocations(value, metadata))
  } else {
    return handleLocations(authorizationDetails, metadata)
  }
}

// copied from sphereon as the method is only available on the client
function handleLocations(authorizationDetails: AuthorizationDetails, metadata: EndpointMetadataResult) {
  if (typeof authorizationDetails === 'string') return authorizationDetails
  if (metadata.credentialIssuerMetadata?.authorization_server || metadata.authorization_endpoint) {
    if (!authorizationDetails.locations) authorizationDetails.locations = [metadata.issuer]
    else if (Array.isArray(authorizationDetails.locations)) authorizationDetails.locations.push(metadata.issuer)
    else authorizationDetails.locations = [authorizationDetails.locations as string, metadata.issuer]
  }
  return authorizationDetails
}
