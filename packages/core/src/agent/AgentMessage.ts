import type { ServiceDecorator } from '../decorators/service/ServiceDecorator'
import type { ReturnRouteTypes } from '../decorators/transport/TransportDecorator'
import type { DidCommMessageVersion } from '../didcomm/types'

export interface AgentMessage {
  readonly type: string

  get didCommVersion(): DidCommMessageVersion
  get id(): string
  get threadId(): string | undefined

  // setServiceDecorator(): ServiceDecorator | undefined
  serviceDecorator(): ServiceDecorator | undefined

  hasAnyReturnRoute(): boolean
  hasReturnRouting(threadId?: string): boolean
  setReturnRouting(type: ReturnRouteTypes, thread?: string): void

  toJSON(params?: { useDidSovPrefixWhereAllowed?: boolean }): Record<string, unknown>
}
