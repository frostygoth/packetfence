import Vue from 'vue'
import { validationMixin } from 'vuelidate'
import { types } from '@/store'

export default {
  namespaced: true,
  state: () => {
    return {
      $meta: {},
      $metaStatus: '',
      $metaMessage: '',

      $form: {},
      $formStatus: '',
      $formMessage: '',

      $validations: {
        $form: {}
      },
      $validationsStatus: '',
      $validationsMessage: ''
    }
  },
  getters: { // { state, getters, rootState, rootGetters }
    isLoading: (state, getters) => getters.$metaLoading || getters.$formLoading || getters.$validationsLoading,
    $meta: (state) => state.$meta,
    $metaLoading: (state) => state.$metaStatus === types.LOADING,
    $metaMessage: (state) => state.$metaMessage,
    $metaStatus: (state) => state.$metaStatus,
    $form: (state) => state.$form,
    $formLoading: (state) => state.$formStatus === types.LOADING,
    $formMessage: (state) => state.$formMessage,
    $formStatus: (state) => state.$formStatus,
    $formAnyError: (state, getters) => getters.$vuelidate.$anyError,
    $formAnyDirty: (state, getters) => getters.$vuelidate.$anyDirty,
    $formDirty: (state, getters) => getters.$vuelidate.$dirty,
    $formError: (state, getters) => getters.$vuelidate.$error,
    $formInvalid: (state, getters) => getters.$vuelidate.$invalid,
    $formPending: (state, getters) => getters.$vuelidate.$pending,
    $formNS: (state, getters) => (namespace, $form = getters.$form) => {
      while (namespace) { // handle namespace
        if (!$form) break
        let [ first, ...remainder ] = namespace.match(/([^.|^\][]+)/g) // split namespace
        namespace = remainder.join('.')
        if (first in $form) { $form = $form[first] } else { break }
      }
      return $form || {}
    },
    $validations: (state) => state.$validations,
    $validationsLoading: (state) => state.$validationsStatus === types.LOADING,
    $validator: (state) => { // vuelidate sandbox
      return new Vue({
        mixins: [ validationMixin ],
        computed: {
          $form () { return state.$form }
        },
        validations () {
          return {
            $form: (state.$validations.$form.constructor === Function)
              ? state.$validations.$form(state.$form, state.$meta)
              : state.$validations.$form
          }
        }
      })
    },
    $vuelidate: (state, getters) => {
      return Object.assign({}, getters.$validator.$v.$form)
    },
    $vuelidateNS: (state, getters) => (namespace, $v = getters.$validator.$v.$form) => {
      while (namespace) { // handle namespace
        if (!$v) break
        let [ first, ...remainder ] = namespace.match(/([^.|^\][]+)/g) // split namespace
        namespace = remainder.join('.')
        if (first in $v) { // named property
          $v = $v[first]
        } else if (!isNaN(+first) && '$each' in $v && first in $v.$each) { // index property
          $v = $v.$each[first]
        } else {
          return {}
        }
      }
      return $v
    },
    $stateNS: (state, getters) => (namespace) => {
      const { $invalid = false, $dirty = false, $anyDirty = false, $error = false, $anyError = false, $pending = false } = getters.$vuelidateNS(namespace)
      return { $invalid, $dirty, $anyDirty, $error, $anyError, $pending }
    },
    $feedbackNS: (state, getters) => (namespace, separator = ' ') => {
      let $v = getters.$vuelidateNS(namespace)
      let feedback = []
      if ('$params' in $v) {
        for (let validation of Object.keys($v.$params)) {
          if (!$v[validation]) feedback.push(validation)
        }
      }
      return feedback.join(separator).trim()
    },
    $vModel: (state) => {
      /**
      * Proxy - helper to avoid exception when accessing an undefined property.
      * Allows a component template to reference a state - or a part of a state - that does not yet exist.
      */
      return new Proxy(state.$form, {
        has: () => true, // always satisfy
        get: (target, namespace) => {
          while (namespace) { // handle namespace
            let [ first, ...remainder ] = namespace.match(/([^.|^\][]+)/g) // split namespace
            if (remainder.length > 0) { // has remaining
              if (!(first in target)) Vue.set(target, first, {})
            } else { // last iteration
              if (target === null) target = {}
              if (!(first in target)) Vue.set(target, first, undefined)
            }
            target = target[first]
            namespace = remainder.join('.')
          }
          return target
        },
        set: (target, namespace, value) => {
          while (namespace) { // handle namespace
            let [ first, ...remainder ] = namespace.match(/([^.|^\][]+)/g) // split namespace
            if (remainder.length > 0) { // has remaining
              if (!target[first]) Vue.set(target, first, {})
            } else { // last iteration
              Vue.set(target, first, value)
              return true
            }
            target = target[first]
            namespace = remainder.join('.')
          }
          return false
        }
      })
    }
  },
  actions: { // { state, rootState, commit, dispatch, getters, rootGetters }
    $touch: ({ getters }) => {
      getters.$validator.$v.$touch()
    },
    setOptions: ({ dispatch }, options) => { // shortcut for setMeta
      return new Promise((resolve, reject) => {
        const { meta } = options
        dispatch('setMeta', meta).then(response => {
          resolve(response)
        }).catch(err => {
          reject(err)
        })
      })
    },
    clearMeta: ({ commit }) => {
      commit('SET_META_SUCCESS', {})
    },
    setMeta: ({ state, commit }, meta) => {
      commit('SET_META_REQUEST')
      return new Promise((resolve, reject) => {
        Promise.resolve(meta).then(meta => {
          commit('SET_META_SUCCESS', meta)
          resolve(state.$meta)
        }).catch(err => {
          commit('SET_META_ERROR', err)
          reject(err)
        })
      })
    },
    clearForm: ({ commit }) => {
      commit('SET_FORM_SUCCESS', {})
    },
    setForm: ({ state, commit }, form) => {
      commit('SET_FORM_REQUEST')
      return new Promise((resolve, reject) => {
        Promise.resolve(form).then(form => {
          commit('SET_FORM_SUCCESS', form)
          resolve(state.$form)
        }).catch(err => {
          commit('SET_FORM_ERROR', err)
          reject(err)
        })
      })
    },
    clearFormValidations: ({ commit }) => {
      commit('SET_FORM_VALIDATIONS_SUCCESS', {})
    },
    setFormValidations: ({ state, commit }, validations) => {
      commit('SET_FORM_VALIDATIONS_REQUEST')
      return new Promise((resolve, reject) => {
        Promise.resolve(validations).then(validations => {
          commit('SET_FORM_VALIDATIONS_SUCCESS', validations)
          resolve(state.$validations)
        }).catch(err => {
          commit('SET_FORM_VALIDATIONS_ERROR', err)
          reject(err)
        })
      })
    }
  },
  mutations: { // state
    SET_META_REQUEST: (state) => {
      state.$metaStatus = types.LOADING
    },
    SET_META_ERROR: (state, data) => {
      state.$metaStatus = types.ERROR
      const { response: { data: { message = '' } = {} } = {} } = data
      state.$metaMessage = message
    },
    SET_META_SUCCESS: (state, meta) => {
      state.$meta = Object.assign({}, meta) // dereference to avoid mutations
      state.$metaStatus = types.SUCCESS
      state.$metaMessage = ''
    },
    SET_FORM_REQUEST: (state) => {
      state.$formStatus = types.LOADING
    },
    SET_FORM_ERROR: (state, data) => {
      state.$formStatus = types.ERROR
      const { response: { data: { message = '' } = {} } = {} } = data
      state.$formMessage = message
    },
    SET_FORM_SUCCESS: (state, form) => {
      state.$form = Object.assign({}, form) // dereference to avoid mutations
      state.$formStatus = types.SUCCESS
      state.$formMessage = ''
    },
    SET_FORM_VALIDATIONS_REQUEST: (state) => {
      state.$validationsStatus = types.LOADING
    },
    SET_FORM_VALIDATIONS_ERROR: (state, data) => {
      state.$validationsStatus = types.ERROR
      const { response: { data: { message = '' } = {} } = {} } = data
      state.$validationsMessage = message
    },
    SET_FORM_VALIDATIONS_SUCCESS: (state, validations) => {
      state.$validations.$form = validations
      state.$validationsStatus = types.SUCCESS
      state.$validationsMessage = ''
    }
  }
}
