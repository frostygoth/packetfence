import i18n from '@/utils/locale'
import pfFormInput from '@/components/pfFormInput'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  and,
  not,
  conditional,
  hasTrafficShapingPolicies,
  trafficShapingPolicyExists
} from '@/globals/pfValidators'
import { required } from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'id',
    label: i18n.t('Traffic Shaping Policy Name'),
    required: true,
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
    text: i18n.t('Traffic Shaping Policy Name'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = () => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'traffic_shaping', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by name'),
    searchableOptions: {
      searchApiEndpoint: 'config/traffic_shaping_policies',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'traffic_shapings' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [
          {
            op: 'or',
            values: [
              { field: 'id', op: 'contains', value: quickCondition }
            ]
          }
        ]
      }
    }
  }
}

export const view = (form, meta = {}) => {
  const {
    isNew = false,
    isClone = false
  } = meta
  return [
    {
      tab: null,
      rows: [
        {
          label: i18n.t('Traffic Shaping Policy Name'),
          cols: [
            {
              namespace: 'id',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'id'),
                ...{
                  disabled: true
                }
              },
              validators: {
                ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
                ...{
                  [i18n.t('Role exists.')]: not(and(required, conditional(isNew || isClone), hasTrafficShapingPolicies, trafficShapingPolicyExists))
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Upload'),
          text: i18n.t(`Bandwidth must be in the following format 'nXY' where XY is one of the following KB,MB,GB,TB,PB.`),
          cols: [
            {
              namespace: 'upload',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'upload'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'upload', i18n.t('Upload'))
            }
          ]
        },
        {
          label: i18n.t('Download'),
          text: i18n.t(`Bandwidth must be in the following format 'nXY' where XY is one of the following KB,MB,GB,TB,PB.`),
          cols: [
            {
              namespace: 'download',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'download'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'download', i18n.t('Download'))
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
      ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
      ...{
        [i18n.t('Role exists.')]: not(and(required, conditional(isNew || isClone), hasTrafficShapingPolicies, trafficShapingPolicyExists))
      }
    },
    upload: pfConfigurationValidatorsFromMeta(meta, 'upload', i18n.t('Upload')),
    download: pfConfigurationValidatorsFromMeta(meta, 'download', i18n.t('Download'))
  }
}