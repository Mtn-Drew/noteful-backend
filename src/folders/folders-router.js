const express = require('express')
const path = require('path')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const sanatizeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
})
const sanatizeNote = note => ({
  id: note.id,
  content: xss(note.content),
  note_name: xss(note.note_name),
  date_modified: note.date_modified,
  folder_id: note.folder_id
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(sanatizeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const folder_name = req.body.folder_name
    const newFolder = { folder_name }
    if (newFolder.folder_name == null) {
      return res.status(400).json({
        error: { message: `Missing folder_name in request body` }
      })
    }
    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(sanatizeFolder(folder))
      })
      .catch(next)
  })
foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getById(req.app.get('db'), req.params.folder_id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder does not exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    FoldersService.getNotesByFolder(req.app.get('db'), req.params.folder_id)
      .then(notes => {
        res.status(201).json(notes.map(sanatizeNote))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const folder_name = req.body.folder_name
    const newName = { folder_name }

    if (!newName.folder_name) {
      return res.status(400).json({
        error: { message: `Request body must contain folder_name` }
      })
    }
    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      newName
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter
