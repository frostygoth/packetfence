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
  hasBillingTiers,
  billingTierExists
} from '@/globals/pfValidators'

const { required } = require('vuelidate/lib/validators')

export const pfConfigurationBillingTiersListColumns = [
  {
    key: 'id',
    label: i18n.t('Identifier'),
    required: true,
    sortable: true,
    visible: true
  },
  {
    key: 'name',
    label: i18n.t('Name'),
    sortable: true,
    visible: true
  },
  {
    key: 'price',
    label: i18n.t('Price'),
    sortable: true,
    visible: true
  },
  {
    key: 'buttons',
    label: '',
    locked: true
  }
]

export const pfConfigurationBillingTiersListFields = [
  {
    value: 'id',
    text: i18n.t('Identifier'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'description',
    text: i18n.t('Description'),
    types: [conditionType.SUBSTRING]
  }
]

export const pfConfigurationBillingTiersListConfig = (context = {}) => {
  const { $i18n } = context
  return {
    columns: pfConfigurationBillingTiersListColumns,
    fields: pfConfigurationBillingTiersListFields,
    rowClickRoute (item) {
      return { name: 'billing_tier', params: { id: item.id } }
    },
    searchPlaceholder: $i18n.t('Search by identifier, name or description'),
    searchableOptions: {
      searchApiEndpoint: 'config/billing_tiers',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'name', op: 'contains', value: null },
            { field: 'description', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'billing_tiers' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [
          {
            op: 'or',
            values: [
              { field: 'id', op: 'contains', value: quickCondition },
              { field: 'name', op: 'contains', value: quickCondition },
              { field: 'description', op: 'contains', value: quickCondition }
            ]
          }
        ]
      }
    }
  }
}

export const pfConfigurationBillingTierViewFields = (context = {}) => {
  const {
    isNew = false,
    isClone = false,
    options: {
      meta = {}
    }
  } = context
  return [
    {
      tab: null, // ignore tabs
      fields: [
        {
          label: i18n.t('Billing Tier'),
          fields: [
            {
              key: 'id',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'id'),
                ...{
                  disabled: (!isNew && !isClone)
                }
              },
              validators: {
                ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
                ...{
                  [i18n.t('Billing Tier exists.')]: not(and(required, conditional(isNew || isClone), hasBillingTiers, billingTierExists))
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Name'),
          fields: [
            {
              key: 'name',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'name'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'name', i18n.t('Name'))
            }
          ]
        },
        {
          label: i18n.t('Description'),
          fields: [
            {
              key: 'description',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'name'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'name', i18n.t('Description'))
            }
          ]
        },
        {
          label: i18n.t('Price'),
          text: i18n.t('The price that will be charged to the customer.'),
          fields: [
            {
              key: 'price',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'price'),
                ...{
                  type: 'number',
                  step: '0.01'
                }
              },
              validators: {
                ...pfConfigurationValidatorsFromMeta(meta, 'price', i18n.t('Price')),
                ...{
                  [i18n.t('Invalid price.')]: conditional((value) => {
                    if (!value) return true
                    return parseFloat(value) >= 0 && ((value || '').split('.')[1] || []).length <= 2
                  })
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Role'),
          text: i18n.t('The target role of the devices that use this tier.'),
          fields: [
            {
              key: 'role',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'role'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'role', i18n.t('Role'))
            }
          ]
        },
        {
          label: i18n.t('Access Duration'),
          text: i18n.t('The access duration of the devices that use this tier.'),
          fields: [
            {
              key: 'access_duration.interval',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'access_duration.interval'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'access_duration.interval', i18n.t('Interval'))
            },
            {
              key: 'access_duration.unit',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'access_duration.unit'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'access_duration.unit', i18n.t('Unit'))
            }
          ]
        },
        {
          label: i18n.t('Use Time Balance'),
          text: i18n.t('Check this box to have the access duration be a real time usage.<br/>This requires a working accounting configuration.'),
          fields: [
            {
              key: 'use_time_balance',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        }
      ]
    }
  ]
}
