import express from 'express'

const app = express()

app.get('/users', (request, response) => {

  // JSON
  response.json([
    'Diego',
    'Cleiton',
    'Robson',
    'Hehe'
  ])
})

app.listen(3333)
