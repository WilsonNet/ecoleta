import Knex from 'knex'
// (Tipos geralmente é letra maíscula)

export async function up (knex: Knex) {
  //criar tabela
  return knex.schema.createTable('point_item', table => {
    table.increments('id').primary()

    table
      .integer('point_id')
      .notNullable()
      .references('id')
      .inTable('points')

    table
      .integer('item_id')
      .notNullable()
      .references('id')
      .inTable('items')

  })
}

export async function down (knex: Knex) {
  // Voltar atrás (deletar tabela)
  return knex.schema.dropTable('point')
}
