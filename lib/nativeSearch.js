var fs = require('fs')
var p = require('path')
var mm = require('minimatch')
var debug = require('debug')('explorer:nativeSearch')
var util = require('util')
import {noDotFiles, sanitize} from './utils.js'
import {score} from './string_score.js'

function recursiveSearch(path, memory, options) {

    return fs.readdirAsync(path)
    .filter(noDotFiles, options.concurrency)
    .each(function(e) {

      e = p.join(path, e)

      let depth = e.split(p.sep).length

      return fs.statAsync(e)
      .then(function(stat) {

        if(!stat.isDirectory()) {
          return Promise.resolve([e])
        }

        //it's a directory
        if(depth > options.maxDepth) {
          return Promise.resolve(e) 
        }

        return recursiveSearch(e, memory, options)
      })
    }, options.concurrency)
    .then(function(paths) {
      //flatten and filter
      paths = [].concat.apply([], paths)
        .filter(options.matchFilter)

      let l = paths.length
      let i = 0

      for(;i<l;i++) {
        memory.paths[memory.i++] = p.relative(options.root, p.join(path, paths[i]))
      }

      return Promise.resolve()
    })
}

function match(search, options) {
  return function(path) {
    if(mm(path, search)) {
      return true 
    }

    if(score(sanitize(path), search) > options.maxScore) {
      return true 
    }

    return false
  }
}

var nativeSearch = function(options) {

  if(!options)
    options = {}

  if(!options.search)
    options.search = {}
  
  options = util._extend({
    concurrency: 100,
    maxDepth: 10,
    maxScore: 0.5
  }, options.search)

  let memory = {paths: [], i: 0, depth: 0}

  debug('search options %o', options)

  return function search(search, path) {
    debug('search path %s', path)
    options.matchFilter = match(search, options)
    options.root = path

    return recursiveSearch(path, memory, options)
    .then(function() {
      // debug('search results %o', memory.paths)
      return Promise.resolve(memory.paths)
    })
    .catch(function(e) {
      console.error(e) 
      return Promise.resolve([])
    })
  }
}

export {nativeSearch}