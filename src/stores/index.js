import Vuex from 'vuex'
import app from './app'
import user from './user'

export default function createStore() {
  return new Vuex.Store({
    modules: { app, user }
  })
}
