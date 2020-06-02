import Knex from 'knex'
// (Tipos geralmente é letra maíscula)

export async function up (knex: Knex) {
  //criar tabela
  return knex.schema.createTable('items', table => {
    table.increments('id').primary()
    table.string('image').notNullable()
    table.string('title').notNullable()
  })
}

export async function down (knex: Knex) {
  // Voltar atrás (deletar tabela)
  return knex.schema.dropTable('point')
}
