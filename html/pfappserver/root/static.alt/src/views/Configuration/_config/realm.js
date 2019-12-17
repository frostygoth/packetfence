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
  hasRealms,
  realmExists
} from '@/globals/pfValidators'

const {
  required
} = require('vuelidate/lib/validators')

export const columns = [
  {
    key: 'id',
    label: i18n.t('Name'),
    required: true,
    sortable: true,
    visible: true
  },
  {
    key: 'domain',
    label: i18n.t('Domain'),
    sortable: true,
    visible: true
  },
  {
    key: 'radius_auth',
    label: i18n.t('RADIUS Authentication'),
    visible: true
  },
  {
    key: 'radius_acct',
    label: i18n.t('RADIUS Accounting'),
    visible: true
  },
  {
    key: 'portal_strip_username',
    label: i18n.t('Strip Portal'),
    sortable: true,
    visible: true
  },
  {
    key: 'admin_strip_username',
    label: i18n.t('Strip Admin'),
    sortable: true,
    visible: true
  },
  {
    key: 'radius_strip_username',
    label: i18n.t('Strip RADIUS'),
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
    text: i18n.t('Identifier'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = (context = {}) => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'realm', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by name'),
    searchableOptions: {
      searchApiEndpoint: 'config/realms',
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
      defaultRoute: { name: 'realms' }
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
          label: i18n.t('Realm'),
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
          label: i18n.t('NTLM Auth Configuration'), labelSize: 'lg'
        },
        {
          label: i18n.t('Domain'),
          text: i18n.t('The domain to use for the authentication in that realm.'),
          cols: [
            {
              namespace: 'domain',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'domain')
            }
          ]
        },
        {
          label: i18n.t('Freeradius Proxy Configuration'), labelSize: 'lg'
        },
        {
          label: i18n.t('Realm Options'),
          text: i18n.t('You can add FreeRADIUS options in the realm definition.'),
          cols: [
            {
              namespace: 'options',
              component: pfFormTextarea,
              attrs: pfConfigurationAttributesFromMeta(meta, 'options')
            }
          ]
        },
        {
          label: i18n.t('RADIUS AUTH'),
          text: i18n.t('The RADIUS Server(s) to proxy authentication.'),
          cols: [
            {
              namespace: 'radius_auth',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'radius_auth')
            }
          ]
        },
        {
          label: i18n.t('Type'),
          text: i18n.t('Home server pool type.'),
          cols: [
            {
              namespace: 'radius_auth_proxy_type',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'radius_auth_proxy_type')
            }
          ]
        },
        {
          label: i18n.t('Authorize from PacketFence'),
          text: i18n.t('Should we forward the request to PacketFence to have a dynamic answer or do we use the remote proxy server answered attributes?'),
          cols: [
            {
              namespace: 'radius_auth_compute_in_pf',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('RADIUS ACCT'),
          text: i18n.t('The RADIUS Server(s) to proxy accounting.'),
          cols: [
            {
              namespace: 'radius_acct_chosen',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'radius_acct_chosen')
            }
          ]
        },
        {
          label: i18n.t('Type'),
          text: i18n.t('Home server pool type.'),
          cols: [
            {
              namespace: 'radius_acct_proxy_type',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'radius_acct_proxy_type')
            }
          ]
        },
        {
          label: i18n.t('Freeradius Eduroam Proxy Configuration'), labelSize: 'lg'
        },
        {
          label: i18n.t('Eduroam Realm Options'),
          text: i18n.t('You can add Eduroam FreeRADIUS options in the realm definition.'),
          cols: [
            {
              namespace: 'eduroam_options',
              component: pfFormTextarea,
              attrs: pfConfigurationAttributesFromMeta(meta, 'eduroam_options')
            }
          ]
        },
        {
          label: i18n.t('Eduroam RADIUS AUTH'),
          text: i18n.t('The RADIUS Server(s) to proxy authentication.'),
          cols: [
            {
              namespace: 'eduroam_radius_auth',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'eduroam_radius_auth')
            }
          ]
        },
        {
          label: i18n.t('Type'),
          text: i18n.t('Home server pool type.'),
          cols: [
            {
              namespace: 'eduroam_radius_auth_proxy_type',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'eduroam_radius_auth_proxy_type')
            }
          ]
        },
        {
          label: i18n.t('Authorize from PacketFence'),
          text: i18n.t('Should we forward the request to PacketFence to have a dynamic answer or do we use the remote proxy server answered attributes?'),
          cols: [
            {
              namespace: 'eduroam_radius_auth_compute_in_pf',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Eduroam RADIUS ACCT'),
          text: i18n.t('The RADIUS Server(s) to proxy accounting.'),
          cols: [
            {
              namespace: 'eduroam_radius_acct_chosen',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'eduroam_radius_acct_chosen')
            }
          ]
        },
        {
          label: i18n.t('Type'),
          text: i18n.t('Home server pool type.'),
          cols: [
            {
              namespace: 'eduroam_radius_acct_proxy_type',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'eduroam_radius_acct_proxy_type')
            }
          ]
        },
        {
          label: i18n.t('Stripping Configuration'), labelSize: 'lg'
        },
        {
          label: i18n.t('Strip on the portal'),
          text: i18n.t('Should the usernames matching this realm be stripped when used on the captive portal.'),
          cols: [
            {
              namespace: 'portal_strip_username',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Strip on the admin'),
          text: i18n.t('Should the usernames matching this realm be stripped when used on the administration interface.'),
          cols: [
            {
              namespace: 'admin_strip_username',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Strip in RADIUS authorization'),
          text: i18n.t(`Should the usernames matching this realm be stripped when used in the authorization phase of 802.1x.\nNote that this doesn't control the stripping in FreeRADIUS, use the options above for that.`),
          cols: [
            {
              namespace: 'radius_strip_username',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Custom attributes'),
          text: i18n.t('Allow to use custom attributes to authenticate 802.1x users (attributes are defined in the source).'),
          cols: [
            {
              namespace: 'permit_custom_attributes',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('LDAP source'),
          text: i18n.t('The LDAP Server to query the custom attributes.'),
          cols: [
            {
              namespace: 'ldap_source',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'ldap_source')
            }
          ]
        }
      ]
    }
  ]
}

export const validators = (form = {}, meta = {}) => {
  const {
    isNew = false,
    isClone = false
  } = meta
  return {
    id: {
      ...pfConfigurationValidatorsFromMeta(meta, 'id', 'ID'),
      ...{
        [i18n.t('Role exists.')]: not(and(required, conditional(isNew || isClone), hasRealms, realmExists))
      }
    },
    domain: pfConfigurationValidatorsFromMeta(meta, 'domain', i18n.t('Domain')),
    options: pfConfigurationValidatorsFromMeta(meta, 'options', i18n.t('Options')),
    radius_auth: pfConfigurationValidatorsFromMeta(meta, 'radius_auth', i18n.t('Servers')),
    radius_auth_proxy_type: pfConfigurationValidatorsFromMeta(meta, 'radius_auth_proxy_type', i18n.t('Type')),
    radius_acct_chosen: pfConfigurationValidatorsFromMeta(meta, 'radius_acct_chosen', i18n.t('Servers')),
    radius_acct_proxy_type: pfConfigurationValidatorsFromMeta(meta, 'radius_acct_proxy_type', i18n.t('Type')),
    eduroam_options: pfConfigurationValidatorsFromMeta(meta, 'eduroam_options', 'Realm options'),
    eduroam_radius_auth: pfConfigurationValidatorsFromMeta(meta, 'eduroam_radius_auth', 'RADIUS AUTH'),
    eduroam_radius_auth_proxy_type: pfConfigurationValidatorsFromMeta(meta, 'eduroam_radius_auth_proxy_type', 'Type'),
    eduroam_radius_acct_chosen: pfConfigurationValidatorsFromMeta(meta, 'eduroam_radius_acct_chosen', 'RADIUS ACCT'),
    eduroam_radius_acct_proxy_type: pfConfigurationValidatorsFromMeta(meta, 'eduroam_radius_acct_proxy_type', 'Type'),
    ldap_source: pfConfigurationValidatorsFromMeta(meta, 'ldap_source', i18n.t('Source'))
  }
}
