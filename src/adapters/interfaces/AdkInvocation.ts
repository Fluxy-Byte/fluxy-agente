// =====================
// Tipos principais
// =====================

export interface AdkInvocation {
    invocationId: string
    author: string
    id: string
    actions: Actions
    longRunningToolIds: string[]
    timestamp: number
    content: Content
    usageMetadata?: UsageMetadata
    finishReason?: string
}

// =====================
// Actions
// =====================

export interface Actions {
    stateDelta: Record<string, any>
    artifactDelta: Record<string, any>
    requestedAuthConfigs: Record<string, any>
    requestedToolConfirmations: Record<string, any>
}

// =====================
// Content
// =====================

export interface Content {
    role: 'model' | 'user' | 'system'
    parts: Part[]
}

// =====================
// Part (Union Type)
// =====================

export type Part =
    | TextPart
    | FunctionCallPart
    | FunctionResponsePart

// =====================
// Text
// =====================

export interface TextPart {
    text: string
}

// =====================
// Function Call
// =====================

export interface FunctionCallPart {
    functionCall: FunctionCall
    thoughtSignature?: string
}

export interface FunctionCall {
    name: string
    args: any // conforme pedido
    id: string
}

// =====================
// Function Response
// =====================

export interface FunctionResponsePart {
    functionResponse: FunctionResponse
}

export interface FunctionResponse {
    id: string
    name: string
    response: any // conforme pedido
}

// =====================
// Usage Metadata
// =====================

export interface UsageMetadata {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
    promptTokensDetails: PromptTokensDetail[]
    thoughtsTokenCount?: number
}

// =====================
// Prompt Tokens
// =====================

export interface PromptTokensDetail {
    modality: string
    tokenCount: number
}
