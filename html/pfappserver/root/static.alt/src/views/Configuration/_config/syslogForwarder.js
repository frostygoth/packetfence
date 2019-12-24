import i18n from '@/utils/locale'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormInput from '@/components/pfFormInput'
import pfFormRangeToggle from '@/components/pfFormRangeToggle'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  and,
  not,
  conditional,
  hasSyslogForwarders,
  syslogForwarderExists
} from '@/globals/pfValidators'
import { required } from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'id',
    label: i18n.t('Syslog Name'),
    required: true,
    sortable: true,
    visible: true
  },
  {
    key: 'type',
    label: i18n.t('Type'),
    sortable: true,
    visible: true
  },
  {
    key: 'buttons',
    label: '',
    locked: true
  }
]

export const fields = [
  {
    value: 'id',
    text: i18n.t('Syslog Name'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'type',
    text: i18n.t('Type'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = () => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'syslogForwarder', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by Syslog name or type'),
    searchableOptions: {
      searchApiEndpoint: 'config/syslog_forwarders',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'type', op: 'contains', value: null },
            { field: 'proto', op: 'contains', value: null },
            { field: 'host', op: 'contains', value: null },
            { field: 'port', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'syslogForwarders' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: quickCondition },
            { field: 'type', op: 'contains', value: quickCondition },
            { field: 'proto', op: 'contains', value: quickCondition },
            { field: 'host', op: 'contains', value: quickCondition },
            { field: 'port', op: 'contains', value: quickCondition }
          ]
        }]
      }
    }
  }
}

export const view = (form = {}, meta = {}) => {
  const {
    isNew = false,
    isClone = false
  } = meta
  return [
    {
      tab: null, // ignore tabs
      rows: [
        {
          label: i18n.t('Syslog Name'),
          cols: [
            {
              namespace: 'id',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'id'),
                ...{
                  disabled: (!isNew && !isClone)
                }
              }
            }
          ]
        },
        {
          if: ['server'].includes(form.type),
          label: i18n.t('Protocol'),
          cols: [
            {
              namespace: 'proto',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'proto')
            }
          ]
        },
        {
          if: ['server'].includes(form.type),
          label: i18n.t('Host'),
          cols: [
            {
              namespace: 'host',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'host')
            }
          ]
        },
        {
          if: ['server'].includes(form.type),
          label: i18n.t('Port'),
          cols: [
            {
              namespace: 'port',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'port')
            }
          ]
        },
        {
          label: i18n.t('All logs'),
          cols: [
            {
              namespace: 'all_logs',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          if: form.all_logs === 'disabled',
          label: i18n.t('Logs'),
          cols: [
            {
              namespace: 'logs',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'logs')
            }
          ]
        }
      ]
    }
  ]
}

export const validators = (form, meta = {}) => {
  const {
    isNew = false,
    isClone = false
  } = meta
  return {
    id: {
      ...pfConfigurationValidatorsFromMeta(meta, 'id', 'ID'),
      ...{
        [i18n.t('Syslog Forwarder exists.')]: not(and(required, conditional(isNew || isClone), hasSyslogForwarders, syslogForwarderExists))
      }
    },
    proto: pfConfigurationValidatorsFromMeta(meta, 'proto', i18n.t('Protocol')),
    host: pfConfigurationValidatorsFromMeta(meta, 'host', i18n.t('Host')),
    port: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port')),
    logs: pfConfigurationValidatorsFromMeta(meta, 'logs', i18n.t('Logs'))
  }
}