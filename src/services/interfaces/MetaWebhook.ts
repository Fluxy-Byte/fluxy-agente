export interface MetaWebhook {
  object: string
  entry: Entry[]
}

export interface Entry {
  id: string
  changes: Change[]
}

export interface Change {
  field: "messages"
  value: ChangeValue
}

export interface ChangeValue {
  messaging_product: "whatsapp"
  metadata: Metadata
  contacts?: Contact[]
  messages?: Message[]
  statuses?: Status[]
}

export interface Metadata {
  display_phone_number: string
  phone_number_id: string
}

export interface Contact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface Message {
  from: string
  id: string
  timestamp: string
  type: "text" | "image" | "audio" | "video" | "document" | "location"
  text?: {
    body?: string
  }
  audio?: {
    mime_type: string,
    sha256: string,
    id: string,
    url: string,
    voice: true
  }
}

export interface Status {
  id: string
  status: "sent" | "delivered" | "read" | "failed"
  timestamp: string
  recipient_id: string
  pricing?: {
    billable: boolean,
    pricing_model: string,
    category: string,
    type: string
  }
}