const express = require('express')
const path = require('path')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const sanatizeNote = (note) => ({
  id: note.id,
  content: xss(note.content),
  name: xss(note.name),
  modified: note.modified,
  folderId: note.folderId
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then((notes) => {
        res.json(notes.map(sanatizeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { content, name, folderId } = req.body
    const newNote = { content, name, folderId }

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    NotesService.insertNote(req.app.get('db'), newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(sanatizeNote(note))
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getById(req.app.get('db'), req.params.note_id)
      .then((note) => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note does not exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanatizeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get('db'), req.params.note_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { content, name, folderId } = req.body
    const noteToUpdate = { content, name, folderId }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must containe either 'name', 'folderId' or 'content'`
        }
      })
    }
    NotesService.updateNote(req.app.get('db'), req.params.note_id, noteToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter
