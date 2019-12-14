const FoldersService = {
  getAllFolders(knex) {
    // return knex.select('*').from('folders')
    return knex.select('*').from('noteful_folders')
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('noteful_folders')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex
      .select('*')
      .from('noteful_folders')
      .where('id', id)
      .first()
  },
  deleteFolder(knex, id) {
    return knex('noteful_folders')
      .where({ id })
      .delete()
  },
  getNotesByFolder(knex, folderId) {
    return knex
      .select('*')
      .from('noteful_notes')
      .where('folder_id', folderId)
  },
  updateFolder(knex, id, newName) {
    return knex('noteful_folders')
      .where({ id })
      .update(newName)
  }
}

module.exports = FoldersService
