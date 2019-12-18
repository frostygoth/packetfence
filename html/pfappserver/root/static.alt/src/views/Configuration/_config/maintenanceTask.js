import i18n from '@/utils/locale'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormInput from '@/components/pfFormInput'
import pfFormRangeToggle from '@/components/pfFormRangeToggle'
import pfFormTextarea from '@/components/pfFormTextarea'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  and,
  not,
  conditional,
  hasMaintenanceTasks,
  maintenanceTaskExists
} from '@/globals/pfValidators'
import {
  required
} from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'status',
    label: i18n.t('Status'),
    sortable: true,
    visible: true
  },
  {
    key: 'id',
    label: i18n.t('Task Name'),
    sortable: true,
    visible: true
  },
  {
    key: 'description',
    label: i18n.t('Description'),
    sortable: true,
    visible: true
  },
  {
    key: 'interval',
    label: i18n.t('Interval'),
    sortable: true,
    visible: true
  }
]

export const fields = [
  {
    value: 'id',
    text: i18n.t('Task Name'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = () => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'maintenance_task', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by name or description'),
    searchableOptions: {
      searchApiEndpoint: 'config/maintenance_tasks',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'description', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'maintenance_tasks' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [
          {
            op: 'or',
            values: [
              { field: 'id', op: 'contains', value: quickCondition },
              { field: 'description', op: 'contains', value: quickCondition }
            ]
          }
        ]
      }
    }
  }
}

export const viewFields = {
  id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Maintenance Task Name'),
      cols: [
        {
          namespace: 'id',
          component: pfFormInput,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'id'),
            ...{
              disabled: true
            }
          }
        }
      ]
    }
  },
  batch: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Batch'),
      text: i18n.t('Amount of items that will be processed in each batch of this task. Batches are executed until there is no more items to process or until the timeout is reached.'),
      cols: [
        {
          namespace: 'batch',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'batch')
        }
      ]
    }
  },
  certificates: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Certificates'),
      text: i18n.t('SSL certificate(s) to monitor. Comma-separated list.'),
      cols: [
        {
          namespace: 'certificates',
          component: pfFormTextarea,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'certificates'),
            ...{
              rows: 5
            }
          }
        }
      ]
    }
  },
  delay: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Delay'),
      text: i18n.t('Minimum gap before certificate expiration date (will the certificate expires in ...).'),
      cols: [
        {
          namespace: 'delay.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'delay.interval')
        },
        {
          namespace: 'delay.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'delay.unit')
        }
      ]
    }
  },
  delete_window: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Delete window'),
      text: i18n.t(`How long can an unregistered node be inactive on the network before being deleted.\nThis shouldn't be used if you are using port-security.`),
      cols: [
        {
          namespace: 'delete_window.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'delete_window.interval')
        },
        {
          namespace: 'delete_window.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'delete_window.unit')
        }
      ]
    }
  },
  description: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Description'),
      cols: [
        {
          namespace: 'description',
          component: pfFormInput,
          attrs: {
            disabled: true
          }
        }
      ]
    }
  },
  interval: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Interval'),
      text: i18n.t('Interval (frequency) at which the task is executed.\nRequires a restart of pfmon to be fully effective. Otherwise, it will be taken in consideration next time the tasks runs.'),
      cols: [
        {
          namespace: 'interval.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'interval.interval')
        },
        {
          namespace: 'interval.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'interval.unit')
        }
      ]
    }
  },
  process_switchranges: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Process switchranges'),
      text: i18n.t('Whether or not a switch range should be expanded to process each of its IPs.'),
      cols: [
        {
          namespace: 'rotate',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'Y', unchecked: 'N' }
          }
        }
      ]
    }
  },
  rotate: (form = {}, meta = {}, logName = 'ip4log') => {
    return {
      label: i18n.t('Rotate'),
      text: i18n.t(`Enable or disable ${logName} rotation (moving ${logName}_history records to ${logName}_archive)\nIf disabled, this task will delete from the ${logName}_history table rather than the ${logName}_archive.`),
      cols: [
        {
          namespace: 'rotate',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'Y', unchecked: 'N' }
          }
        }
      ]
    }
  },
  rotate_batch: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Rotate batch'),
      text: i18n.t('Amount of items that will be processed in each batch of this task. Batches are executed until there is no more items to process or until the timeout is reached.'),
      cols: [
        {
          namespace: 'rotate_batch',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'rotate_batch')
        }
      ]
    }
  },
  rotate_timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Rotate timeout'),
      text: i18n.t('Maximum amount of time this task can run.'),
      cols: [
        {
          namespace: 'rotate_timeout.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'rotate_timeout.interval')
        },
        {
          namespace: 'rotate_timeout.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'rotate_timeout.unit')
        }
      ]
    }
  },
  rotate_window: (form = {}, meta = {}, logName = 'ip4log') => {
    return {
      label: i18n.t('Rotate window'),
      text: i18n.t(`How long to keep ${logName} history entry before rotating it to ${logName} archive.`),
      cols: [
        {
          namespace: 'rotate_window.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'rotate_window.interval')
        },
        {
          namespace: 'rotate_window.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'rotate_window.unit')
        }
      ]
    }
  },
  status: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Enabled'),
      text: i18n.t('Whether or not this task is enabled.\nRequires a restart of pfmon to be effective.'),
      cols: [
        {
          namespace: 'status',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'enabled', unchecked: 'disabled' }
          }
        }
      ]
    }
  },
  timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Timeout'),
      text: i18n.t('Maximum amount of time this task can run.'),
      cols: [
        {
          namespace: 'timeout.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'timeout.interval')
        },
        {
          namespace: 'timeout.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'timeout.unit')
        }
      ]
    }
  },
  unreg_window: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Unreg window'),
      text: i18n.t('How long can a registered node be inactive on the network before it becomes unregistered.'),
      cols: [
        {
          namespace: 'unreg_window.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'unreg_window.interval')
        },
        {
          namespace: 'unreg_window.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'unreg_window.unit')
        }
      ]
    }
  },
  window: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Window'),
      text: i18n.t('Window to apply the job to. In the case of a deletion, setting this to 7 days would delete affected data older than 7 days.'),
      cols: [
        {
          namespace: 'window.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'window.interval')
        },
        {
          namespace: 'window.unit',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'window.unit')
        }
      ]
    }
  }
}

export const view = (form = {}, meta = {}) => {
  const {
    id
  } = form
  switch (id) {
    case 'acct_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta)
          ]
        }
      ]
    case 'acct_maintenance':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'auth_log_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta)
          ]
        }
      ]
    case 'cleanup_chi_database_cache':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta)
          ]
        }
      ]
    case 'cluster_check':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'fingerbank_data_update':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'inline_accounting_maintenance':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'ip4log_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta),
            viewFields.rotate(form, meta, 'ip4log'),
            viewFields.rotate_batch(form, meta),
            viewFields.rotate_timeout(form, meta),
            viewFields.rotate_window(form, meta, 'ip4log')
          ]
        }
      ]
    case 'ip6log_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta),
            viewFields.rotate(form, meta, 'ip6log'),
            viewFields.rotate_batch(form, meta),
            viewFields.rotate_timeout(form, meta),
            viewFields.rotate_window(form, meta, 'ip6log')
          ]
        }
      ]
    case 'locationlog_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta)
          ]
        }
      ]
    case 'node_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.unreg_window(form, meta),
            viewFields.delete_window(form, meta)
          ]
        }
      ]
    case 'nodes_maintenance':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'option82_query':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'person_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'populate_ntlm_redis_cache':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'provisioning_compliance_poll':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    case 'radius_audit_log_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta)
          ]
        }
      ]
    case 'dns_audit_log_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta)
          ]
        }
      ]
    case 'admin_api_audit_log_cleanup':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta),
            viewFields.window(form, meta)
          ]
        }
      ]
    case 'security_event_maintenance':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.batch(form, meta),
            viewFields.timeout(form, meta)
          ]
        }
      ]
    case 'switch_cache_lldpLocalPort_description':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.process_switchranges(form, meta)
          ]
        }
      ]
    case 'certificates_check':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta),
            viewFields.delay(form, meta),
            viewFields.certificates(form, meta)
          ]
        }
      ]
    case 'password_of_the_day':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.status(form, meta),
            viewFields.interval(form, meta)
          ]
        }
      ]
    default:
      return [
        {
          tab: null, // ignore tabs
          rows: []
        }
      ]
  }
}

export const validatorFields = {
  id: (form = {}, meta = {}) => {
    const {
      isNew = false
    } = meta
    return {
      id: {
        ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
        ...{
          [i18n.t('Maintenance Task exists.')]: not(and(required, conditional(isNew), hasMaintenanceTasks, maintenanceTaskExists))
        }
      }
    }
  },
  batch: (form = {}, meta = {}) => {
    return { batch: pfConfigurationValidatorsFromMeta(meta, 'batch', i18n.t('Batch')) }
  },
  certificates: (form = {}, meta = {}) => {
    return { certificates: pfConfigurationValidatorsFromMeta(meta, 'certificates', i18n.t('Certificates')) }
  },
  delay: (form = {}, meta = {}) => {
    return {
      delay: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'delay.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'delay.unit', i18n.t('Unit'))
      }
    }
  },
  delete_window: (form = {}, meta = {}) => {
    return {
      delete_window: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'delete_window.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'delete_window.unit', i18n.t('Unit'))
      }
    }
  },
  description: (form = {}, meta = {}) => {},
  interval: (form = {}, meta = {}) => {
    return {
      interval: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'interval.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'interval.unit', i18n.t('Unit'))
      }
    }
  },
  process_switchranges: (form = {}, meta = {}) => {},
  rotate: (form = {}, meta = {}, logName = 'ip4log') => {},
  rotate_batch: (form = {}, meta = {}) => {
    return { rotate_batch: pfConfigurationValidatorsFromMeta(meta, 'rotate_batch', i18n.t('Batch')) }
  },
  rotate_timeout: (form = {}, meta = {}) => {
    return {
      rotate_timeout: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'rotate_timeout.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'rotate_timeout.unit', i18n.t('Unit'))
      }
    }
  },
  rotate_window: (form = {}, meta = {}, logName = 'ip4log') => {
    return {
      rotate_window: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'rotate_window.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'rotate_window.unit', i18n.t('Unit'))
      }
    }
  },
  status: (form = {}, meta = {}) => {},
  timeout: (form = {}, meta = {}) => {
    return {
      timeout: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'timeout.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'timeout.unit', i18n.t('Unit'))
      }
    }
  },
  unreg_window: (form = {}, meta = {}) => {
    return {
      unreg_window: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'unreg_window.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'unreg_window.unit', i18n.t('Unit'))
      }
    }
  },
  window: (form = {}, meta = {}) => {
    return {
      window: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'window.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'window.unit', i18n.t('Unit'))
      }
    }
  }
}

export const validators = (form = {}, meta = {}) => {
  const {
    id
  } = form
  switch (id) {
    case 'acct_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta)
      }
    case 'acct_maintenance':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'auth_log_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta)
      }
    case 'cleanup_chi_database_cache':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta)
      }
    case 'cluster_check':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'fingerbank_data_update':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'inline_accounting_maintenance':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'ip4log_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta),
        ...validatorFields.rotate(form, meta, 'ip4log'),
        ...validatorFields.rotate_batch(form, meta),
        ...validatorFields.rotate_timeout(form, meta),
        ...validatorFields.rotate_window(form, meta, 'ip4log')
      }
    case 'ip6log_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta),
        ...validatorFields.rotate(form, meta, 'ip6log'),
        ...validatorFields.rotate_batch(form, meta),
        ...validatorFields.rotate_timeout(form, meta),
        ...validatorFields.rotate_window(form, meta, 'ip6log')
      }
    case 'locationlog_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta)
      }
    case 'node_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.unreg_window(form, meta),
        ...validatorFields.delete_window(form, meta)
      }
    case 'nodes_maintenance':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'option82_query':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'person_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'populate_ntlm_redis_cache':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'provisioning_compliance_poll':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    case 'radius_audit_log_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta)
      }
    case 'dns_audit_log_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta)
      }
    case 'admin_api_audit_log_cleanup':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.window(form, meta)
      }
    case 'security_event_maintenance':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.batch(form, meta),
        ...validatorFields.timeout(form, meta)
      }
    case 'switch_cache_lldpLocalPort_description':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.process_switchranges(form, meta)
      }
    case 'certificates_check':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta),
        ...validatorFields.delay(form, meta),
        ...validatorFields.certificates(form, meta)
      }
    case 'password_of_the_day':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.status(form, meta),
        ...validatorFields.interval(form, meta)
      }
    default:
      return {}
  }
}
