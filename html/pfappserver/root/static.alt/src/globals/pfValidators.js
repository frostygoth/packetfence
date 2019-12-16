/**
 * Custom Vuelidate Validators
 *
 * See Builtin Validators: https://monterail.github.io/vuelidate/#sub-builtin-validators
 *
 * Vuelidate version 0.7.3 functions that do not handle Promises:
 *
 *  - and
 *  - or
 *  - not
 *
**/
import store from '@/store'
import { parse, format, isValid, compareAsc } from 'date-fns'
import { createDebouncer } from 'promised-debounce'

const debounceTime = 300 // 300ms

const _common = require('vuelidate/lib/validators/common')

/**
 *
 * Misc local helpers
 *
**/

// Get the unique id of a given $v.
const idOfV = ($v) => {
  if ($v.constructor === String) return undefined
  const { '__ob__': { dep: { id } } } = $v
  return id || undefined
}

/**
 *  Get the parent $v of a given id.
 *
 *  For use with "Field" functions.
 *  Searches for a member from a given |id|,
 *   starts with the base $v, and traverses the entire $v model tree recursively,
 *   returns the members' parent.
**/
const parentVofId = ($v, id) => {
  const params = Object.keys($v.$params)
  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    if (typeof $v[param] === 'object' && typeof $v[param].$model === 'object') {
      if ($v[param].$model && '__ob__' in $v[param].$model) {
        if (idOfV($v[param].$model) === id) return $v
      }
      // recurse
      let $parent = parentVofId($v[param], id)
      if ($parent) return $parent
    }
  }
  return undefined
}

// Get the id, parent and params from a given $v member
const idParentParamsFromV = (vBase, vMember) => {
  const id = idOfV(vMember)
  const parent = (id) ? parentVofId(vBase, id) : undefined
  const params = (id) ? Object.entries(parent.$params) : undefined
  return { id: id, parent: parent, params: params }
}

/**
 * Default replacements - Fix Promises
**/

// Default vuelidate |and| replacement, handles Promises
export const and = (...validators) => {
  return _common.withParams({ type: 'and' }, function (...args) {
    return (
      validators.length > 0 &&
      Promise.all(validators.map(fn => fn.apply(this, args))).then(values => {
        return values.reduce((valid, value) => {
          return valid && value
        }, true)
      })
    )
  })
}

// Default vuelidate |or| replacement, handles Promises
export const or = (...validators) => {
  return _common.withParams({ type: 'and' }, function (...args) {
    return (
      validators.length > 0 &&
      Promise.all(validators.map(fn => fn.apply(this, args))).then(values => {
        return values.reduce((valid, value) => {
          return valid || value
        }, false)
      })
    )
  })
}

// Default vuelidate |not| replacement, handles Promises
export const not = (validator) => {
  return _common.withParams({ type: 'not' }, function (value, vm) {
    let newValue = validator.call(this, value, vm)
    if (Promise.resolve(newValue) === newValue) { // is it a Promise?
      // wait for promise to resolve before inverting it
      return newValue.then((value) => !value)
    }
    return !newValue
  })
}

// Default vuelidate |alphaNum| replacement, accepts underscore
export const alphaNum = () => {
  return _common.regex('alphaNum', /^[a-zA-Z0-9_]*$/)
}

/**
 *
 * Custom functions
 *
**/
export const conditional = (conditional) => {
  return (0, _common.withParams)({
    type: 'conditional',
    conditional: conditional
  }, function (value, vm) {
    return (conditional && conditional.constructor === Function)
      ? (value === undefined)
        ? conditional(undefined, vm)
        : conditional(JSON.parse(JSON.stringify(value)), vm) // dereference value
      : conditional
  })
}

export const inArray = (array) => {
  return (0, _common.withParams)({
    type: 'inArray',
    array: array
  }, function (value) {
    return !(0, _common.req)(value) || array.includes(value)
  })
}

export const ipAddress = (value) => {
  if (!value) return true
  return /^(([0-9]{1,3}.){3,3}[0-9]{1,3})$/i.test(value)
}

export const ipv6Address = (value) => {
  if (!value) return true
  return /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/i.test(value)
}

export const isCIDR = (value) => {
  if (!value) return true
  const [ipv4, network, ...extra] = value.split('/')
  return (
    extra.length === 0 &&
    ~~network > 0 && ~~network < 31 &&
    ipv4 && ipAddress(ipv4)
  )
}

export const isDateFormat = (dateFormat, allowZero = true) => {
  return (0, _common.withParams)({
    type: 'isDateFormat',
    dateFormat: dateFormat,
    allowZero: allowZero
  }, function (value) {
    return !(0, _common.req)(value) || format(parse(value), dateFormat) === value || (dateFormat.replace(/[a-z]/gi, '0') === value && allowZero)
  })
}

export const isFingerbankDevice = (value) => {
  if (!value) return true
  return /^([0-9A-F]{3})$/i.test(value)
}

export const isFingerprint = (value) => {
  if (!value) return true
  return /^(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),)?)+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)
}

export const isFQDN = (value) => {
  if (!value) return true
  const parts = value.split('.')
  const tld = parts.pop()
  if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
    return false
  }
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    if (part.indexOf('__') >= 0) {
      return false
    }
    if (!/^[a-z\u00a1-\uffff0-9-_]+$/i.test(part)) {
      return false
    }
    if (/[\uff01-\uff5e]/.test(part)) {
      // disallow full-width chars
      return false
    }
    if (part[0] === '-' || part[part.length - 1] === '-') {
      return false
    }
  }
  return true
}

export const isHex = (value) => {
  if (!value) return true
  return /^[0-9a-f]+$/i.test(value)
}

export const isMacAddress = (value) => {
  if (!value) return true
  return value.toLowerCase().replace(/[^0-9a-f]/g, '').length === 12
}

export const isOUI = (separator = ':') => {
  return (0, _common.withParams)({
    type: 'isOUI',
    separator: separator
  }, function (value) {
    if (!value) return true
    if (separator === '') {
      return /^([0-9A-F]{6})$/i.test(value)
    } else {
      value.split(separator).forEach(segment => {
        if (!/^([0-9A-F]{2})$/i.test(segment)) return false
      })
      return true
    }
  })
}

export const isPattern = (pattern) => {
  return (0, _common.withParams)({
    type: 'isPattern',
    pattern: pattern
  }, function (value) {
    const re = new RegExp(`^${pattern}$`)
    return !(0, _common.req)(value) || re.test(value)
  })
}

export const isPort = (value) => {
  if (!value) return true
  return ~~value === parseFloat(value) && ~~value >= 1 && ~~value <= 65535
}

export const isPrice = (value) => {
  if (!value) return true
  return /^-?\d+\.\d{2}$/.test(value)
}

export const isVLAN = (value) => {
  if (!value) return true
  return ~~value === parseFloat(value) && ~~value >= 1 && ~~value <= 4096
}

export const emailsCsv = (value) => {
  if (!value) return true
  const emailRegex = /(^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/
  const emails = value.split(',')
  for (var i = 0; i < emails.length; i++) {
    if (!emailRegex.test(emails[i].trim())) return false
  }
  return true
}

export const compareDate = (comparison, date = new Date(), dateFormat = 'YYYY-MM-DD HH:mm:ss', allowZero = true) => {
  return (0, _common.withParams)({
    type: 'compareDate',
    comparison: comparison,
    date: date,
    dateFormat: dateFormat,
    allowZero: allowZero
  }, function (value) {
    // ignore empty or zero'd (0000-00-00...)
    if (!value || (value === dateFormat.replace(/[a-z]/gi, '0') && allowZero)) return true
    // round date/value using dateFormat
    date = parse(format((date instanceof Date && isValid(date) ? date : parse(date)), dateFormat))
    value = parse(format((value instanceof Date && isValid(value) ? value : parse(value)), dateFormat))
    // compare
    const cmp = compareAsc(value, date)
    switch (comparison.toLowerCase()) {
      case '>': case 'gt': return (cmp > 0)
      case '>=': case 'gte': return (cmp >= 0)
      case '<': case 'lt': return (cmp < 0)
      case '<=': case 'lte': return (cmp <= 0)
      case '===': case 'eq': return (cmp === 0)
      case '!==': case 'ne': return (cmp !== 0)
      default: return false
    }
  })
}

export const isValidUnregDateByAclUser = (dateFormat = 'YYYY-MM-DD', allowZero = true) => {
  return (0, _common.withParams)({
    type: 'isValidUnregDateByAclUser',
    dateFormat: dateFormat,
    allowZero: allowZero
  }, function (value) {
    // ignore empty or zero'd (0000-00-00...)
    if (!value || (value === dateFormat.replace(/[a-z]/gi, '0') && allowZero)) return true
    value = parse(format((value instanceof Date && isValid(value) ? value : parse(value)), dateFormat))
    return store.dispatch('session/getAllowedUserUnregDate').then((response) => {
      const { 0: unregDate } = response
      if (unregDate) {
        return compareAsc(parse(unregDate), value) >= 0
      }
      return true
    }).catch(() => {
      return true
    })
  })
}

export const isFilenameWithExtension = (extensions = ['html']) => {
  return (0, _common.withParams)({
    type: 'isFilenameWithExtension',
    extensions: extensions
  }, function (value) {
    const re = RegExp('^[a-zA-Z0-9_]*\\.(' + extensions.join('|') + ')$')
    return re.test(value)
  })
}

export const hasAdminRoles = () => {
  return store.dispatch('config/getAdminRoles').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasBillingTiers = () => {
  return store.dispatch('config/getBillingTiers').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasConnectionProfiles = () => {
  return store.dispatch('config/getConnectionProfiles').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSelfServices = () => {
  return store.dispatch('config/getSelfServices').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasDomains = () => {
  return store.dispatch('config/getDomains').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasFirewalls = () => {
  return store.dispatch('config/getFirewalls').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasFloatingDevices = () => {
  return store.dispatch('config/getFloatingDevices').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasInterfaces = () => {
  return store.dispatch('config/getInterfaces').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasLayer2Networks = () => {
  return store.dispatch('config/getLayer2Networks').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasMaintenanceTasks = () => {
  return store.dispatch('config/getMaintenanceTasks').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasPkiProviders = () => {
  return store.dispatch('config/getPkiProviders').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasPortalModules = () => {
  return store.dispatch('config/getPortalModules').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasProvisionings = () => {
  return store.dispatch('config/getProvisionings').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasRealms = () => {
  return store.dispatch('config/getRealms').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasRoles = () => {
  return store.dispatch('config/getRoles').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasRoutedNetworks = () => {
  return store.dispatch('config/getRoutedNetworks').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasScans = () => {
  return store.dispatch('config/getScans').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSecurityEvents = () => {
  return store.dispatch('config/getSecurityEvents').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSources = () => {
  return store.dispatch('config/getSources').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSwitches = () => {
  return store.dispatch('config/getSwitches').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSwitchGroups = () => {
  return store.dispatch('config/getSwitchGroups').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSyslogForwarders = () => {
  return store.dispatch('config/getSyslogForwarders').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasSyslogParsers = () => {
  return store.dispatch('config/getSyslogParsers').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasTrafficShapingPolicies = () => {
  return store.dispatch('config/getTrafficShapingPolicies').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasWmiRules = () => {
  return store.dispatch('config/getWmiRules').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

export const hasWRIXLocations = () => {
  return store.dispatch('config/getWrixLocations').then((response) => {
    return (response.length > 0)
  }).catch(() => {
    return true
  })
}

let adminRolesExistsDebouncer
export const adminRoleExists = (value) => {
  if (!value) return true
  if (!adminRolesExistsDebouncer) {
    adminRolesExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    adminRolesExistsDebouncer({
      handler: () => {
        store.dispatch('config/getAdminRoles').then((response) => {
          resolve(response.filter(adminRole => adminRole.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let billingTierExistsDebouncer
export const billingTierExists = (value) => {
  if (!value) return true
  if (!billingTierExistsDebouncer) {
    billingTierExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    billingTierExistsDebouncer({
      handler: () => {
        store.dispatch('config/getBillingTiers').then((response) => {
          resolve(response.filter(billingTier => billingTier.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let categoryIdNumberExistsDebouncer
export const categoryIdNumberExists = (value) => {
  if (!value || !/^\d+$/.test(value)) return true
  if (!categoryIdNumberExistsDebouncer) {
    categoryIdNumberExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    categoryIdNumberExistsDebouncer({
      handler: () => {
        store.dispatch('config/getRoles').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(role => role.category_id === value).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let categoryIdStringExistsDebouncer
export const categoryIdStringExists = (value) => {
  if (!value || /^\d+$/.test(value)) return true
  if (!categoryIdStringExistsDebouncer) {
    categoryIdStringExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    categoryIdStringExistsDebouncer({
      handler: () => {
        store.dispatch('config/getRoles').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(role => role.name.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let connectionProfileExistsDebouncer
export const connectionProfileExists = (value) => {
  if (!value) return true
  if (!connectionProfileExistsDebouncer) {
    connectionProfileExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    connectionProfileExistsDebouncer({
      handler: () => {
        store.dispatch('config/getConnectionProfiles').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(connectionProfile => connectionProfile.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let selfServiceExistsDebouncer
export const selfServiceExists = (value) => {
  if (!value) return true
  if (!selfServiceExistsDebouncer) {
    selfServiceExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    selfServiceExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSelfServices').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(selfService => selfService.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let domainExistsDebouncer
export const domainExists = (value) => {
  if (!value) return true
  if (!domainExistsDebouncer) {
    domainExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    domainExistsDebouncer({
      handler: () => {
        store.dispatch('config/getDomains').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(domain => domain.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let firewallExistsDebouncer
export const firewallExists = (value) => {
  if (!value) return true
  if (!firewallExistsDebouncer) {
    firewallExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    firewallExistsDebouncer({
      handler: () => {
        store.dispatch('config/getFirewalls').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(firewall => firewall.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let floatingDeviceExistsDebouncer
export const floatingDeviceExists = (value) => {
  if (!value) return true
  if (!floatingDeviceExistsDebouncer) {
    floatingDeviceExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    floatingDeviceExistsDebouncer({
      handler: () => {
        store.dispatch('config/getFloatingDevices').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(floatingDevice => floatingDevice.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let interfaceExistsDebouncer
export const interfaceExists = (value) => {
  if (!value) return true
  if (!interfaceExistsDebouncer) {
    interfaceExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    interfaceExistsDebouncer({
      handler: () => {
        store.dispatch('config/getInterfaces').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(iface => iface.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let interfaceVlanExistsDebouncer
export const interfaceVlanExists = (id) => {
  return (0, _common.withParams)({
    type: 'interfaceVlanExists',
    id: id
  }, function (value) {
    if (!(0, _common.req)(value)) return true
    if (!interfaceVlanExistsDebouncer) {
      interfaceVlanExistsDebouncer = createDebouncer()
    }
    return new Promise((resolve) => {
      interfaceVlanExistsDebouncer({
        handler: () => {
          store.dispatch('config/getInterfaces').then((response) => {
            if (response.length === 0) resolve(true)
            else resolve(response.filter(iface => iface.master === id && iface.vlan === value).length > 0)
          }).catch(() => {
            resolve(true)
          })
        },
        time: debounceTime
      })
    })
  })
}

let fingerbankCombinationExistsDebouncer
export const fingerbankCombinationExists = (value) => {
  if (!value) return true
  if (!fingerbankCombinationExistsDebouncer) {
    fingerbankCombinationExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    fingerbankCombinationExistsDebouncer({
      handler: () => {
        store.dispatch('fingerbank/getCombination', value).then(() => {
          resolve(true)
        }).catch(() => {
          resolve(false)
        })
      },
      time: debounceTime
    })
  })
}

let layer2NetworkExistsDebouncer
export const layer2NetworkExists = (value) => {
  if (!value) return true
  if (!layer2NetworkExistsDebouncer) {
    layer2NetworkExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    layer2NetworkExistsDebouncer({
      handler: () => {
        store.dispatch('config/getLayer2Networks').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(layer2Network => layer2Network.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let maintenanceTaskExistsDebouncer
export const maintenanceTaskExists = (value) => {
  if (!value) return true
  if (!maintenanceTaskExistsDebouncer) {
    maintenanceTaskExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    maintenanceTaskExistsDebouncer({
      handler: () => {
        store.dispatch('config/getMaintenanceTasks').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(maintenanceTask => maintenanceTask.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let nodeExistsDebouncer
export const nodeExists = (value) => {
  if (!value) return true
  // standardize MAC address
  value = value.toLowerCase().replace(/[^0-9a-f]/g, '').split('').reduce((a, c, i) => {
    a += ((i % 2) === 0 || i >= 11) ? c : c + ':'
    return a
  })
  if (value.length !== 17) return true
  if (!nodeExistsDebouncer) {
    nodeExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    nodeExistsDebouncer({
      handler: () => {
        store.dispatch('$_nodes/exists', value).then(() => {
          resolve(false)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let pkiProviderExistsDebouncer
export const pkiProviderExists = (value) => {
  if (!value) return true
  if (!pkiProviderExistsDebouncer) {
    pkiProviderExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    pkiProviderExistsDebouncer({
      handler: () => {
        store.dispatch('config/getPkiProviders').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(provider => provider.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let portalModuleExistsDebouncer
export const portalModuleExists = (value) => {
  if (!value) return true
  if (!portalModuleExistsDebouncer) {
    portalModuleExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    portalModuleExistsDebouncer({
      handler: () => {
        store.dispatch('config/getPortalModules').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(module => module.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let provisioningExistsDebouncer
export const provisioningExists = (value) => {
  if (!value) return true
  if (!provisioningExistsDebouncer) {
    provisioningExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    provisioningExistsDebouncer({
      handler: () => {
        store.dispatch('config/getProvisionings').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(provisioning => provisioning.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let realmExistsDebouncer
export const realmExists = (value) => {
  if (!value) return true
  if (!realmExistsDebouncer) {
    realmExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    realmExistsDebouncer({
      handler: () => {
        store.dispatch('config/getRealms').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(realm => realm.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let roleExistsDebouncer
export const roleExists = (value) => {
  if (!value) return true
  if (!roleExistsDebouncer) {
    roleExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    roleExistsDebouncer({
      handler: () => {
        store.dispatch('config/getRoles').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(role => role.name.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let routedNetworkExistsDebouncer
export const routedNetworkExists = (value) => {
  if (!value) return true
  if (!routedNetworkExistsDebouncer) {
    routedNetworkExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    routedNetworkExistsDebouncer({
      handler: () => {
        store.dispatch('config/getRoutedNetworks').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(routedNetwork => routedNetwork.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let scanExistsDebouncer
export const scanExists = (value) => {
  if (!value) return true
  if (!scanExistsDebouncer) {
    scanExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    scanExistsDebouncer({
      handler: () => {
        store.dispatch('config/getScans').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(scan => scan.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let securityEventExistsDebouncer
export const securityEventExists = (value) => {
  if (!value) return true
  if (!securityEventExistsDebouncer) {
    securityEventExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    securityEventExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSecurityEvents').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(securityEvent => securityEvent.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let sourceExistsDebouncer
export const sourceExists = (value) => {
  if (!value) return true
  if (!sourceExistsDebouncer) {
    sourceExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    sourceExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSources').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(source => source.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let switchExistsDebouncer
export const switchExists = (value) => {
  if (!value) return true
  if (!switchExistsDebouncer) {
    switchExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    switchExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSwitches').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(switche => switche.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let switchGroupExistsDebouncer
export const switchGroupExists = (value) => {
  if (!value) return true
  if (!switchGroupExistsDebouncer) {
    switchGroupExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    switchGroupExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSwitchGroups').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(switchGroup => switchGroup.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let syslogForwarderExistsDebouncer
export const syslogForwarderExists = (value) => {
  if (!value) return true
  if (!syslogForwarderExistsDebouncer) {
    syslogForwarderExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    syslogForwarderExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSyslogForwarders').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(syslogForwarder => syslogForwarder.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let syslogParserExistsDebouncer
export const syslogParserExists = (value) => {
  if (!value) return true
  if (!syslogParserExistsDebouncer) {
    syslogParserExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    syslogParserExistsDebouncer({
      handler: () => {
        store.dispatch('config/getSyslogParsers').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(syslogParser => syslogParser.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let trafficShapingPolicyExistsDebouncer
export const trafficShapingPolicyExists = (value) => {
  if (!value) return true
  if (!trafficShapingPolicyExistsDebouncer) {
    trafficShapingPolicyExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    trafficShapingPolicyExistsDebouncer({
      handler: () => {
        store.dispatch('config/getTrafficShapingPolicies').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(trafficShapingPolicy => trafficShapingPolicy.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let userExistsDebouncer
export const userExists = (value) => {
  if (!value) return true
  if (!userExistsDebouncer) {
    userExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    userExistsDebouncer({
      handler: () => {
        store.dispatch('$_users/exists', value).then(() => {
          resolve(true)
        }).catch(() => {
          resolve(false)
        })
      },
      time: debounceTime
    })
  })
}

let userNotExistsDebouncer
export const userNotExists = (value) => {
  if (!value) return true
  if (!userNotExistsDebouncer) {
    userNotExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    userNotExistsDebouncer({
      handler: () => {
        store.dispatch('$_users/exists', value).then(() => {
          resolve(false)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let wmiRuleExistsDebouncer
export const wmiRuleExists = (value) => {
  if (!value) return true
  if (!wmiRuleExistsDebouncer) {
    wmiRuleExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    wmiRuleExistsDebouncer({
      handler: () => {
        store.dispatch('config/getWmiRules').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(wmiRule => wmiRule.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

let WRIXLocationExistsDebouncer
export const WRIXLocationExists = (value) => {
  if (!value) return true
  if (!WRIXLocationExistsDebouncer) {
    WRIXLocationExistsDebouncer = createDebouncer()
  }
  return new Promise((resolve) => {
    WRIXLocationExistsDebouncer({
      handler: () => {
        store.dispatch('config/getWrixLocations').then((response) => {
          if (response.length === 0) resolve(true)
          else resolve(response.filter(wrixLocation => wrixLocation.id.toLowerCase() === value.toLowerCase()).length > 0)
        }).catch(() => {
          resolve(true)
        })
      },
      time: debounceTime
    })
  })
}

/**
 * Field functions
 *
 * For use with pfFormField component.
 * Used to validate |key| fields with immediate siblings.
 * All functions ignore self.
**/

// Limit the count of sibling field |keys|
export const limitSiblingFields = (keys, limit = 0) => {
  return (0, _common.withParams)({
    type: 'limitSiblingFields',
    keys: keys,
    limit: limit
  }, function (value, field) {
    if (!value) return true
    const _keys = (keys.constructor === Array) ? keys : [keys] // force Array
    let count = 0
    const { id, parent, params } = idParentParamsFromV(this.$v, field)
    if (params) {
      // iterate through all params
      for (let i = 0; i < params.length; i++) {
        const [param] = params[i] // destructure
        if (!parent[param].$model) continue // ignore empty models
        if (idOfV(parent[param].$model) === id) continue // ignore (self)
        // iterate through all keys, continue on 1st mismatch
        if (_keys.find(key => {
          return parent[param].$model[key] !== field[key]
        })) {
          continue // GTFO
        }
        if (++count > limit) return false
      }
    }
    return true
  })
}

// Require all of sibling field |key|s
export const requireAllSiblingFields = (key, ...fieldTypes) => {
  return (0, _common.withParams)({
    type: 'requireAllSiblingFields',
    key: key,
    fieldTypes: fieldTypes
  }, function (value, field) {
    if (!value) return true
    // dereference, preserve original
    let _fieldTypes = JSON.parse(JSON.stringify(fieldTypes))
    const { id, parent, params } = idParentParamsFromV(this.$v, field)
    if (params) {
      // iterate through all params
      for (let i = 0; i < params.length; i++) {
        const [param] = params[i] // destructure
        if (!parent[param].$model) continue // ignore empty models
        if (idOfV(parent[param].$model) === id) continue // ignore (self)
        // iterate through _fieldTypes and substitute
        _fieldTypes = _fieldTypes.map(fieldType => {
          // substitute the fieldType with |true| if it exists
          return (parent[param].$model[key] === fieldType) ? true : fieldType
        })
      }
    }
    // return |true| if all members of the the array are |true|,
    // anything else return false
    return _fieldTypes.reduce((bool, fieldType) => { return bool && (fieldType === true) }, true)
  })
}

// Require any of sibling field |key|s
export const requireAnySiblingFields = (key, ...fieldTypes) => {
  return (0, _common.withParams)({
    type: 'requireAnySiblingFields',
    key: key,
    fieldTypes: fieldTypes
  }, function (value, field) {
    if (!value) return true
    // dereference, preserve original
    let _fieldTypes = JSON.parse(JSON.stringify(fieldTypes))
    const { id, parent, params } = idParentParamsFromV(this.$v, field)
    if (params) {
      // iterate through all params
      for (let i = 0; i < params.length; i++) {
        const [param] = params[i] // destructure
        if (!parent[param].$model) continue // ignore empty models
        if (idOfV(parent[param].$model) === id) continue // ignore (self)
        // return |true| if any fieldType exists
        if (_fieldTypes.includes(parent[param].$model[key])) return true
      }
    }
    // otherwise return false
    return false
  })
}

// Restrict all of sibling field |key|s
export const restrictAllSiblingFields = (key, ...fieldTypes) => {
  return (0, _common.withParams)({
    type: 'restrictAllSiblingFields',
    key: key,
    fieldTypes: fieldTypes
  }, function (value, field) {
    if (!value) return true
    // dereference, preserve original
    let _fieldTypes = JSON.parse(JSON.stringify(fieldTypes))
    const { id, parent, params } = idParentParamsFromV(this.$v, field)
    if (params) {
      // iterate through all params
      for (let i = 0; i < params.length; i++) {
        const [param] = params[i] // destructure
        if (!parent[param].$model) continue // ignore empty models
        if (idOfV(parent[param].$model) === id) continue // ignore (self)
        // iterate through _fieldTypes and substitute
        _fieldTypes = _fieldTypes.map(fieldType => {
          // substitute the fieldType with |true| if it exists
          return (parent[param].$model[key] === fieldType) ? true : fieldType
        })
      }
    }
    // return |false| if all members of the the array are |true|,
    // anything else return true
    return !_fieldTypes.reduce((bool, fieldType) => { return bool && (fieldType === true) }, true)
  })
}

// Restrict any of sibling field |key|s
export const restrictAnySiblingFields = (key, ...fieldTypes) => {
  return (0, _common.withParams)({
    type: 'restrictAnySiblingFieldTypes',
    key: key,
    fieldTypes: fieldTypes
  }, function (value, field) {
    if (!value) return true
    // dereference, preserve original
    let _fieldTypes = JSON.parse(JSON.stringify(fieldTypes))
    const { id, parent, params } = idParentParamsFromV(this.$v, field)
    if (params) {
      // iterate through all params
      for (let i = 0; i < params.length; i++) {
        const [param] = params[i] // destructure
        if (!parent[param].$model) continue // ignore empty models
        if (idOfV(parent[param].$model) === id) continue // ignore (self)
        // return |false| if any fieldType exists
        if (_fieldTypes.includes(parent[param].$model[key])) return false
      }
    }
    // otherwise return true
    return true
  })
}
