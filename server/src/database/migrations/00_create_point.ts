import Knex from 'knex'
// (Tipos geralmente é letra maíscula)

export async function up (knex: Knex) {
  //criar tabela
  return knex.schema.createTable('point', table => {
    table.increments('id').primary()
    table.string('image').notNullable()
    table.string('name').notNullable()
    table.string('email').notNullable()
    table.string('whatsapp').notNullable()
    table.string('latitude').notNullable()
    table.string('longitude').notNullable()
    table.string('city').notNullable()
    table.string('uf', 2).notNullable()
  })
}

export async function down (knex: Knex) {
  // Voltar atrás (deletar tabela)
  return knex.schema.dropTable('point') 

}

