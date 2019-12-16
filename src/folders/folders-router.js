const express = require('express')
const path = require('path')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const sanatizeFolder = (folder) => ({
  id: folder.id,
  name: xss(folder.name)
})
const sanatizeNote = (note) => ({
  id: note.id,
  content: xss(note.content),
  name: xss(note.name),
  modified: note.modified,
  folderId: note.folderId
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then((folders) => {
        res.json(folders.map(sanatizeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const name = req.body.name
    const newFolder = { name }
    if (newFolder.name == null) {
      return res.status(400).json({
        error: { message: `Missing name in request body` }
      })
    }
    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(sanatizeFolder(folder))
      })
      .catch(next)
  })
foldersRouter
  .route('/:folderId')
  .all((req, res, next) => {
    FoldersService.getById(req.app.get('db'), req.params.folderId)
      .then((folder) => {
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
    FoldersService.getNotesByFolder(req.app.get('db'), req.params.folderId)
      .then((notes) => {
        res.status(201).json(notes.map(sanatizeNote))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.folderId)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const name = req.body.name
    const newName = { name }

    if (!newName.name) {
      return res.status(400).json({
        error: { message: `Request body must contain name` }
      })
    }
    FoldersService.updateFolder(req.app.get('db'), req.params.folderId, newName)
      .then((numRowsAffected) => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter
