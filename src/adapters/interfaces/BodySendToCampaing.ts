export interface BodyTemplate {
    "type": string,
    "body": {
        "messaging_product": string,
        "recipient_type": string,
        "to": string,
        "type": string,
        "template": {
            "name": string,
            "language": {
                "code": string
            },
            "components": any[]
        }
    }
}