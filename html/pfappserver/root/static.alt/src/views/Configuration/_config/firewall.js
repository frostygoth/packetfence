import i18n from '@/utils/locale'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormInput from '@/components/pfFormInput'
import pfFormPassword from '@/components/pfFormPassword'
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
  hasFirewalls,
  firewallExists
} from '@/globals/pfValidators'
import {
  required
} from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'id',
    label: i18n.t('Hostname or IP'),
    required: true,
    sortable: true,
    visible: true
  },
  {
    key: 'type',
    label: i18n.t('Firewall Type'),
    sortable: true,
    visible: true
  },
  {
    key: 'port',
    label: i18n.t('Port'),
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
    text: i18n.t('Name'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'type',
    text: i18n.t('Type'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'port',
    text: i18n.t('Port'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = () => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'firewall', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by hostname, ip, port or firewall type'),
    searchableOptions: {
      searchApiEndpoint: 'config/firewalls',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'port', op: 'contains', value: null },
            { field: 'type', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'firewalls' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: quickCondition },
            { field: 'port', op: 'contains', value: quickCondition },
            { field: 'type', op: 'contains', value: quickCondition }
          ]
        }]
      }
    }
  }
}

export const view = (form = {}, meta = {}) => {
  const {
    isNew = false,
    isClone = false,
    firewallType = null
  } = meta
  return [
    {
      tab: null, // ignore tabs
      rows: [
        {
          label: i18n.t('Hostname or IP Address'),
          text: ['FamilyZone'].includes(firewallType) ? i18n.t('Include the region in the FQDN when using the cloud version (ex: login.myregion.linewize.net).') : null,
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
          if: ['BarracudaNG', 'JSONRPC', 'JuniperSRX', 'FamilyZone'].includes(firewallType),
          label: i18n.t('Username'),
          cols: [
            {
              namespace: 'username',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'username')
            }
          ]
        },
        {
          if: ['BarracudaNG', 'Checkpoint', 'FortiGate', 'Iboss', 'JuniperSRX', 'WatchGuard', 'LightSpeedRocket', 'SmoothWall', 'FamilyZone'].includes(firewallType),
          label: i18n.t('Secret or Key'),
          cols: [
            {
              namespace: 'password',
              component: pfFormPassword,
              attrs: pfConfigurationAttributesFromMeta(meta, 'password')
            }
          ]
        },
        {
          if: ['JSONRPC'].includes(firewallType),
          label: i18n.t('Password'),
          cols: [
            {
              namespace: 'password',
              component: pfFormPassword,
              attrs: pfConfigurationAttributesFromMeta(meta, 'password')
            }
          ]
        },
        {
          if: ['BarracudaNG', 'Checkpoint', 'FortiGate', 'Iboss', 'JuniperSRX', 'WatchGuard', 'JSONRPC', 'LightSpeedRocket', 'SmoothWall'].includes(firewallType),
          label: i18n.t('Port of the service'),
          text: i18n.t('If you use an alternative port, please specify.'),
          cols: [
            {
              namespace: 'port',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'port')
            }
          ]
        },
        {
          if: ['PaloAlto'].includes(firewallType),
          label: i18n.t('Vsys'),
          text: i18n.t('Please define the Virtual System number. This only has an effect when used with the HTTP transport.'),
          cols: [
            {
              namespace: 'vsys',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'vsys')
            }
          ]
        },
        {
          if: ['FamilyZone'].includes(firewallType),
          label: i18n.t('DeviceID'),
          text: i18n.t('Please define the DeviceID.'),
          cols: [
            {
              namespace: 'deviceid',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'deviceid')
            }
          ]
        },
        {
          if: ['PaloAlto'].includes(firewallType),
          label: i18n.t('Transport'),
          cols: [
            {
              namespace: 'transport',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'transport')
            }
          ]
        },
        {
          if: ['PaloAlto'].includes(firewallType),
          label: i18n.t('Port of the service'),
          text: i18n.t('If you use an alternative port, please specify. This parameter is ignored when the Syslog transport is selected.'),
          cols: [
            {
              namespace: 'port',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'port')
            }
          ]
        },
        {
          if: ['PaloAlto'].includes(firewallType),
          label: i18n.t('Secret or Key'),
          text: i18n.t('If using the HTTP transport, specify the password for the Palo Alto API.'),
          cols: [
            {
              namespace: 'password',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'password')
            }
          ]
        },
        {
          if: ['Iboss'].includes(firewallType),
          label: i18n.t('NAC name'),
          text: i18n.t('Should match the NAC name from the Iboss configuration.'),
          cols: [
            {
              namespace: 'nac_name',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'nac_name')
            }
          ]
        },
        {
          label: i18n.t('Roles'),
          text: i18n.t('Nodes with the selected roles will be affected.'),
          cols: [
            {
              namespace: 'categories',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'categories')
            }
          ]
        },
        {
          label: i18n.t('Networks on which to do SSO'),
          text: i18n.t('Comma delimited list of networks on which the SSO applies.\nFormat : 192.168.0.0/24'),
          cols: [
            {
              namespace: 'networks',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'networks')
            }
          ]
        },
        {
          label: i18n.t('Cache updates'),
          text: i18n.t('Enable this to debounce updates to the Firewall.\nBy default, PacketFence will send a SSO on every DHCP request for every device. Enabling this enables "sleep" periods during which the update is not sent if the informations stay the same.'),
          cols: [
            {
              namespace: 'cache_updates',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Cache timeout'),
          text: i18n.t('Adjust the "Cache timeout" to half the expiration delay in your firewall.\nYour DHCP renewal interval should match this value.'),
          cols: [
            {
              namespace: 'cache_timeout',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'cache_timeout')
            }
          ]
        },
        {
          label: i18n.t('Username format'),
          text: i18n.t('Defines how to format the username that is sent to your firewall. $username represents the username and $realm represents the realm of your user if applicable. $pf_username represents the unstripped username as it is stored in the PacketFence database. If left empty, it will use the username as stored in PacketFence (value of $pf_username).'),
          cols: [
            {
              namespace: 'username_format',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'username_format')
            }
          ]
        },
        {
          label: i18n.t('Default realm'),
          text: i18n.t('The default realm to be used while formatting the username when no realm can be extracted from the username.'),
          cols: [
            {
              namespace: 'default_realm',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'default_realm')
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
    isClone = false,
  } = meta
  return {
    id: {
      ...pfConfigurationValidatorsFromMeta(meta, 'id', 'ID'),
      ...{
        [i18n.t('Firewall exists.')]: not(and(required, conditional(isNew || isClone), hasFirewalls, firewallExists))
      }
    },
    username: pfConfigurationValidatorsFromMeta(meta, 'username', i18n.t('Username')),
    password: pfConfigurationValidatorsFromMeta(meta, 'password', i18n.t('Password')),
    port: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port')),
    vsys: pfConfigurationValidatorsFromMeta(meta, 'vsys', i18n.t('Number')),
    deviceid: pfConfigurationValidatorsFromMeta(meta, 'deviceid', i18n.t('DeviceID')),
    transport: pfConfigurationValidatorsFromMeta(meta, 'transport', i18n.t('Transport')),
    nac_name: pfConfigurationValidatorsFromMeta(meta, 'nac_name', i18n.t('Name')),
    categories: pfConfigurationValidatorsFromMeta(meta, 'categories', i18n.t('Roles')),
    networks: pfConfigurationValidatorsFromMeta(meta, 'networks', i18n.t('Networks')),
    cache_timeout: pfConfigurationValidatorsFromMeta(meta, 'cache_timeout', i18n.t('Timeout')),
    username_format: pfConfigurationValidatorsFromMeta(meta, 'username_format', i18n.t('Format')),
    default_realm: pfConfigurationValidatorsFromMeta(meta, 'default_realm', i18n.t('Realm'))
  }
}
