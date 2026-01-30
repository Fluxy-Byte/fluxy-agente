interface componentsOfTheCampaing {
  "type": string;
  "text": string;
}

export interface BodyReqCampaing {
  type: string;
  body: BodyToSendCampaign;
}

export interface BodyToSendCampaign {
  "messaging_product": string;
  "recipient_type": string;
  "to": string;
  "type": string;
  "template": {
    "name": string,
    "language": {
      "code": string
    },
    "components": componentsOfTheCampaing[]
  }
}