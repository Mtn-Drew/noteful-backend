const FoldersService = {
  getAllFolders(knex) {
    // return knex.select('*').from('folders')
    return knex.select('*').from('folders')
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('folders')
      .returning('*')
      .then((rows) => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex
      .select('*')
      .from('folders')
      .where('id', id)
      .first()
  },
  deleteFolder(knex, id) {
    return knex('folders')
      .where({ id })
      .delete()
  },
  getNotesByFolder(knex, folder_id) {
    return knex
      .select('*')
      .from('notes')
      .where('folder_id', folder_id)
  },
  updateFolder(knex, id, newName) {
    return knex('folders')
      .where({ id })
      .update(newName)
  }
}

module.exports = FoldersService
