# poup-be
Backend para recebimento e envio de mensagem


Projeto criado com Next JS + TypeScript + Express


Missão de desenvolimento:

- Criar webhook para recebimento de mensangens
- IA generativa gerar resposta para a duvida do cliente
- Enviar mensagem para cliente


Dados ara o .env

URL_RABBITMQ=amqp://poup_api:mdlpExzzLzHCSht37TER1v5E@147.79.110.10:5672
PORT=5096

KEY_GERMINI=AIzaSyDXaarSQadSEHXBW2jrQ7nNlwkMKQwLsvY

TOKEN_TESTE_API_WHATS=EAAMnomjTfl4BQQZCol5ZAjAWqM1xvzRQFt07G5qgjSSO7QqiluretxtmJmZBWFcTADDZBZCfaoQuZAkxXUFcUQozdumqxZCJ3cEgNPpVG7joFXQKTDXW26st0ewUZCBcE20DYZB1xGqIzfJGR40RoJ819zUZCmkutZCAEkZAkRDdZC2h0htAPY8WRF51wINlLq5PTPZCosAmbinlfeWZAS5NkopZBq5CR4WvKFq3r7O78paBEjcE7iY9ghkxSZA1ZAlbhCJhYLtKaXjc2c4kK2OCAdX4bkCe9Ocke4ZAAZDZD  


Consulta Germini

curl --location 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent' \
--header 'Content-Type: application/json' \
--header 'x-goog-api-key: AIzaSyDXaarSQadSEHXBW2jrQ7nNlwkMKQwLsvY' \
--data '{
    "contents": [
      {
        "parts": [
          {
            "text": "Resuma o maximo possivel sobre o que e programação?"
          }
        ]
      }
    ]
  }'
  

Envio tamplate

curl -i -X POST `
  https://graph.facebook.com/v22.0/903493939520850/messages `
  -H 'Authorization: Bearer EAAMnomjTfl4BQQZCol5ZAjAWqM1xvzRQFt07G5qgjSSO7QqiluretxtmJmZBWFcTADDZBZCfaoQuZAkxXUFcUQozdumqxZCJ3cEgNPpVG7joFXQKTDXW26st0ewUZCBcE20DYZB1xGqIzfJGR40RoJ819zUZCmkutZCAEkZAkRDdZC2h0htAPY8WRF51wINlLq5PTPZCosAmbinlfeWZAS5NkopZBq5CR4WvKFq3r7O78paBEjcE7iY9ghkxSZA1ZAlbhCJhYLtKaXjc2c4kK2OCAdX4bkCe9Ocke4ZAAZDZD' `
  -H 'Content-Type: application/json' `
  -d '{ \"messaging_product\": \"whatsapp\", \"to\": \"5534997801829\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }'