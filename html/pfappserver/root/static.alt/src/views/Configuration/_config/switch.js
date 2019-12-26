import i18n from '@/utils/locale'
import pfFieldTypeValue from '@/components/pfFieldTypeValue'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormFields from '@/components/pfFormFields'
import pfFormInput from '@/components/pfFormInput'
import pfFormPassword from '@/components/pfFormPassword'
import pfFormRangeToggleDefault from '@/components/pfFormRangeToggleDefault'
import pfFormTextarea from '@/components/pfFormTextarea'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import { pfFieldType as fieldType } from '@/globals/pfField'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  and,
  not,
  or,
  conditional,
  isMacAddress,
  isPort,
  hasSwitches,
  switchExists
} from '@/globals/pfValidators'
import {
  required,
  maxLength
} from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'id',
    label: i18n.t('Identifier'),
    required: true,
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
    key: 'group',
    label: i18n.t('Group'),
    sortable: true,
    visible: true,
    formatter: (value, key, item) => {
      if (!value) item.group = i18n.t('default')
    }
  },
  {
    key: 'type',
    label: i18n.t('Type'),
    sortable: true,
    visible: true
  },
  {
    key: 'mode',
    label: i18n.t('Mode'),
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
  },
  {
    value: 'description',
    text: i18n.t('Description'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'mode',
    text: i18n.t('Mode'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'type',
    text: i18n.t('Type'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = (context = {}) => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'switch', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by identifier or description'),
    searchableOptions: {
      searchApiEndpoint: 'config/switches',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'description', op: 'contains', value: null },
            { field: 'type', op: 'contains', value: null },
            { field: 'mode', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'switches' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [
          {
            op: 'or',
            values: [
              { field: 'id', op: 'contains', value: quickCondition },
              { field: 'description', op: 'contains', value: quickCondition },
              { field: 'type', op: 'contains', value: quickCondition },
              { field: 'mode', op: 'contains', value: quickCondition }
            ]
          }
        ]
      }
    }
  }
}

export const inlineTriggers = {
  always: {
    value: 'always',
    text: i18n.t('Always'),
    types: [fieldType.NONE]
  },
  port: {
    value: 'port',
    text: i18n.t('Port'),
    types: [fieldType.INTEGER],
    validators: {
      value: {
        [i18n.t('Invalid Port Number.')]: isPort
      }
    }
  },
  mac: {
    value: 'mac',
    text: i18n.t('MAC Address'),
    types: [fieldType.SUBSTRING],
    validators: {
      value: {
        [i18n.t('Invalid MAC address.')]: isMacAddress
      }
    }
  },
  ssid: {
    value: 'ssid',
    text: i18n.t('Wi-Fi Network SSID'),
    types: [fieldType.SUBSTRING]
  }
}

export const placeholder = (meta = {}, key = null) => {
  const { [key]: { placeholder = null } = {} } = meta
  return placeholder
}

export const supports = (form = {}, meta = {}, options = []) => {
  const { type } = form
  const { type: { allowed = [] } = { } } = meta
  return allowed.find(group => {
    return group.options.find(switche => {
      const { value, supports = [] } = switche
      if (value === type) {
        return supports.find(option => {
          // Return true if the switch model supports *any* of the specified options
          return options.includes(option)
        })
      }
    })
  })
}

export const viewFields = {
  id: (form = {}, meta = {}) => {
    const {
      isNew = false,
      isClone = false
    } = meta
    return {
      label: i18n.t('IP Address/MAC Address/Range (CIDR)'),
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
    }
  },
  AccessListMap: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['AccessListBasedEnforcement']),
      label: i18n.t('Role by Access List'),
      cols: [
        {
          namespace: 'AccessListMap',
          component: pfFormRangeToggleDefault,
          attrs: {
            tooltip: false,
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'AccessListMap') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'AccessListMap') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'AccessListMap') }) }
          }
        }
      ]
    }
  },
  cliAccess: (form = {}, meta = {}) => {
    return {
      label: i18n.t('CLI Access Enabled'),
      text: i18n.t('Allow this switch to use PacketFence as a RADIUS server for CLI access.'),
      cols: [
        {
          namespace: 'cliAccess',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'cliAccess') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'cliAccess') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'cliAccess') }) }
          }
        }
      ]
    }
  },
  cliEnablePwd: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Enable Password'),
      cols: [
        {
          namespace: 'cliEnablePwd',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'cliEnablePwd')
        }
      ]
    }
  },
  cliPwd: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Password'),
      cols: [
        {
          namespace: 'cliPwd',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'cliPwd')
        }
      ]
    }
  },
  cliTransport: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Transport'),
      cols: [
        {
          namespace: 'cliTransport',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'cliTransport')
        }
      ]
    }
  },
  cliUser: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Username'),
      cols: [
        {
          namespace: 'cliUser',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'cliUser')
        }
      ]
    }
  },
  coaPort: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x', 'WirelessMacAuth', 'WirelessDot1x']),
      label: i18n.t('CoA Port'),
      text: i18n.t('For CoA request, if we have to send to another port.'),
      cols: [
        {
          namespace: 'coaPort',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'coaPort')
        }
      ]
    }
  },
  controllerIp: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['WirelessMacAuth', 'WirelessDot1x']),
      label: i18n.t('Controller IP Address'),
      text: i18n.t('Use instead this IP address for de-authentication requests. Normally used for Wi-Fi only.'),
      cols: [
        {
          namespace: 'controllerIp',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'controllerIp')
        }
      ]
    }
  },
  deauthMethod: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Deauthentication Method'),
      cols: [
        {
          namespace: 'deauthMethod',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'deauthMethod')
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
          attrs: pfConfigurationAttributesFromMeta(meta, 'description')
        }
      ]
    }
  },
  disconnectPort: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x', 'WirelessMacAuth', 'WirelessDot1x']),
      label: i18n.t('Disconnect Port'),
      text: i18n.t('For Disconnect request, if we have to send to another port.'),
      cols: [
        {
          namespace: 'disconnectPort',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'disconnectPort')
        }
      ]
    }
  },
  ExternalPortalEnforcement: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['ExternalPortal']),
      label: i18n.t('External Portal Enforcement'),
      text: i18n.t('Enable external portal enforcement when supported by network equipment.'),
      cols: [
        {
          namespace: 'ExternalPortalEnforcement',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'ExternalPortalEnforcement') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'ExternalPortalEnforcement') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'ExternalPortalEnforcement') }) }
          }
        }
      ]
    }
  },
  group: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Switch Group'),
      cols: [
        {
          namespace: 'group',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'group')
        }
      ]
    }
  },
  inlineTrigger: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Inline Conditions'),
      text: i18n.t('Set inline mode if any of the conditions are met.'),
      cols: [
        {
          namespace: 'inlineTrigger',
          component: pfFormFields,
          attrs: {
            buttonLabel: i18n.t('Add Condition'),
            sortable: false,
            field: {
              component: pfFieldTypeValue,
              attrs: {
                typeLabel: i18n.t('Select condition type'),
                valueLabel: i18n.t('Select condition value'),
                fields: [
                  inlineTriggers.always,
                  inlineTriggers.port,
                  inlineTriggers.mac,
                  inlineTriggers.ssid
                ]
              }
            },
            invalidFeedback: i18n.t('Inline Conditions contain one or more errors.')
          }
        }
      ]
    }
  },
  macSearchesMaxNb: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Maximum MAC addresses'),
      text: i18n.t('Maximum number of MAC addresses retrived from a port.'),
      cols: [
        {
          namespace: 'macSearchesMaxNb',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'macSearchesMaxNb')
        }
      ]
    }
  },
  macSearchesSleepInterval: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Sleep interval'),
      text: i18n.t('Sleep interval between queries of MAC addresses.'),
      cols: [
        {
          namespace: 'macSearchesSleepInterval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'macSearchesSleepInterval')
        }
      ]
    }
  },
  mapAccessList: (form = {}, meta = {}) => {
    const {
      AccessListMap
    } = form
    const {
      roles = [],
      advancedMode = false
    } = meta
    return [
      { id: 'registration', label: i18n.t('registration') },
      { id: 'isolation', label: i18n.t('isolation') },
      { id: 'macDetection', label: i18n.t('macDetection') },
      { id: 'inline', label: i18n.t('inline') },
      ...roles
    ].map(role => {
      return {
        if: ((advancedMode || supports(form, meta, ['AccessListBasedEnforcement'])) && (AccessListMap === 'Y' || (!AccessListMap && placeholder(meta, 'AccessListMap') === 'Y'))),
        label: role.label || role.id,
        cols: [
          {
            namespace: `${role.id}AccessList`,
            component: pfFormTextarea,
            attrs: {
              ...pfConfigurationAttributesFromMeta(meta, `${role.id}AccessList`),
              ...{
                rows: 3
              }
            }
          }
        ]
      }
    })
  },
  mapRole: (form = {}, meta = {}) => {
    const {
      RoleMap
    } = form
    const {
      roles = [],
      advancedMode = false
    } = meta
    return [
      { id: 'registration', label: i18n.t('registration') },
      { id: 'isolation', label: i18n.t('isolation') },
      { id: 'macDetection', label: i18n.t('macDetection') },
      { id: 'inline', label: i18n.t('inline') },
      ...roles
    ].map(role => {
      return {
        if: ((advancedMode || supports(form, meta, ['RoleBasedEnforcement'])) && (RoleMap === 'Y' || (!RoleMap && placeholder(meta, 'RoleMap') === 'Y'))),
        label: role.label || role.id,
        cols: [
          {
            namespace: `${role.id}Role`,
            component: pfFormInput,
            attrs: pfConfigurationAttributesFromMeta(meta, `${role.id}Role`)
          }
        ]
      }
    })
  },
  mapUrl: (form = {}, meta = {}) => {
    const {
      UrlMap
    } = form
    const {
      roles = [],
      advancedMode = false
    } = meta
    return [
      { id: 'registration', label: i18n.t('registration') },
      { id: 'isolation', label: i18n.t('isolation') },
      { id: 'macDetection', label: i18n.t('macDetection') },
      { id: 'inline', label: i18n.t('inline') },
      ...roles
    ].map(role => {
      return {
        if: ((advancedMode || supports(form, meta, ['ExternalPortal'])) && (UrlMap === 'Y' || (!UrlMap && placeholder(meta, 'UrlMap') === 'Y'))),
        label: role.label || role.id,
        cols: [
          {
            namespace: `${role.id}Url`,
            component: pfFormInput,
            attrs: pfConfigurationAttributesFromMeta(meta, `${role.id}Url`)
          }
        ]
      }
    })
  },
  mapVlan: (form = {}, meta = {}) => {
    const {
      VlanMap
    } = form
    const {
      roles = [],
      advancedMode = false
    } = meta
    return [
      { id: 'registration', label: i18n.t('registration') },
      { id: 'isolation', label: i18n.t('isolation') },
      { id: 'macDetection', label: i18n.t('macDetection') },
      { id: 'inline', label: i18n.t('inline') },
      ...roles
    ].map(role => {
      return {
        if: ((advancedMode || supports(form, meta, ['RadiusDynamicVlanAssignment'])) && (VlanMap === 'Y' || (!VlanMap && placeholder(meta, 'VlanMap') === 'Y'))),
        label: role.label || role.id,
        cols: [
          {
            namespace: `${role.id}Vlan`,
            component: pfFormInput,
            attrs: pfConfigurationAttributesFromMeta(meta, `${role.id}Vlan`)
          }
        ]
      }
    })
  },
  mode: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Mode'),
      cols: [
        {
          namespace: 'mode',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'mode')
        }
      ]
    }
  },
  radiusSecret: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Secret Passphrase'),
      cols: [
        {
          namespace: 'radiusSecret',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'radiusSecret')
        }
      ]
    }
  },
  RoleMap: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['RoleBasedEnforcement']),
      label: i18n.t('Role by Switch Role'),
      cols: [
        {
          namespace: 'RoleMap',
          component: pfFormRangeToggleDefault,
          attrs: {
            tooltip: false,
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'RoleMap') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'RoleMap') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'RoleMap') }) }
          }
        }
      ]
    }
  },
  SNMPAuthPasswordRead: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Password Read'),
      cols: [
        {
          namespace: 'SNMPAuthPasswordRead',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPAuthPasswordRead')
        }
      ]
    }
  },
  SNMPAuthPasswordTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Password Trap'),
      cols: [
        {
          namespace: 'SNMPAuthPasswordTrap',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPAuthPasswordTrap')
        }
      ]
    }
  },
  SNMPAuthPasswordWrite: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Password Write'),
      cols: [
        {
          namespace: 'SNMPAuthPasswordWrite',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPAuthPasswordWrite')
        }
      ]
    }
  },
  SNMPAuthProtocolRead: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Protocol Read'),
      cols: [
        {
          namespace: 'SNMPAuthProtocolRead',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPAuthProtocolRead')
        }
      ]
    }
  },
  SNMPAuthProtocolTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Protocol Trap'),
      cols: [
        {
          namespace: 'SNMPAuthProtocolTrap',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPAuthProtocolTrap')
        }
      ]
    }
  },
  SNMPAuthProtocolWrite: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Protocol Write'),
      cols: [
        {
          namespace: 'SNMPAuthProtocolWrite',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPAuthProtocolWrite')
        }
      ]
    }
  },
  SNMPCommunityRead: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Community Read'),
      cols: [
        {
          namespace: 'SNMPCommunityRead',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPCommunityRead')
        }
      ]
    }
  },
  SNMPCommunityTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Community Trap'),
      cols: [
        {
          namespace: 'SNMPCommunityTrap',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPCommunityTrap')
        }
      ]
    }
  },
  SNMPCommunityWrite: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Community Write'),
      cols: [
        {
          namespace: 'SNMPCommunityWrite',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPCommunityWrite')
        }
      ]
    }
  },
  SNMPEngineID: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Community Write'),
      cols: [
        {
          namespace: 'SNMPCommunityWrite',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPCommunityWrite')
        }
      ]
    }
  },
  SNMPPrivPasswordRead: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Priv Password Read'),
      cols: [
        {
          namespace: 'SNMPPrivPasswordRead',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPPrivPasswordRead')
        }
      ]
    }
  },
  SNMPPrivPasswordTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Priv Password Trap'),
      cols: [
        {
          namespace: 'SNMPPrivPasswordTrap',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPPrivPasswordTrap')
        }
      ]
    }
  },
  SNMPPrivPasswordWrite: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Priv Password Write'),
      cols: [
        {
          namespace: 'SNMPPrivPasswordWrite',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPPrivPasswordWrite')
        }
      ]
    }
  },
  SNMPPrivProtocolRead: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Priv Protocol Read'),
      cols: [
        {
          namespace: 'SNMPPrivProtocolRead',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPPrivProtocolRead')
        }
      ]
    }
  },
  SNMPPrivProtocolTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Priv Protocol Trap'),
      cols: [
        {
          namespace: 'SNMPPrivProtocolTrap',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPPrivProtocolTrap')
        }
      ]
    }
  },
  SNMPPrivProtocolWrite: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Priv Protocol Write'),
      cols: [
        {
          namespace: 'SNMPPrivProtocolWrite',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPPrivProtocolWrite')
        }
      ]
    }
  },
  SNMPUserNameWrite: (form = {}, meta = {}) => {
    return {
      label: i18n.t('User Name Write'),
      cols: [
        {
          namespace: 'SNMPUserNameWrite',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPUserNameWrite')
        }
      ]
    }
  },
  SNMPUserNameRead: (form = {}, meta = {}) => {
    return {
      label: i18n.t('User Name Read'),
      cols: [
        {
          namespace: 'SNMPUserNameRead',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPUserNameRead')
        }
      ]
    }
  },
  SNMPUserNameTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('User Name Trap'),
      cols: [
        {
          namespace: 'SNMPUserNameTrap',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPUserNameTrap')
        }
      ]
    }
  },
  SNMPVersion: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Version'),
      cols: [
        {
          namespace: 'SNMPVersion',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPVersion')
        }
      ]
    }
  },
  SNMPVersionTrap: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Version Trap'),
      cols: [
        {
          namespace: 'SNMPVersionTrap',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'SNMPVersionTrap')
        }
      ]
    }
  },
  type: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Type'),
      cols: [
        {
          namespace: 'type',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'type'),
            ...{
              groupLabel: 'group',
              groupValues: 'options'
            },
            optionsLimit: 1000
          }
        }
      ]
    }
  },
  uplink: (form = {}, meta = {}) => {
    const {
      uplink_dynamic: uplinkDynamic
    } = form
    const {
      advancedMode = false
    } = meta
    return {
      if: ((advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x'])) && ((uplinkDynamic && uplinkDynamic !== 'dynamic') || (!uplinkDynamic && placeholder(meta, 'uplink_dynamic') !== 'dynamic'))),
      label: i18n.t('Static Uplinks'),
      text: i18n.t('Comma-separated list of the switch uplinks.'),
      cols: [
        {
          namespace: 'uplink',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'uplink')
        }
      ]
    }
  },
  uplink_dynamic: (form = {}, meta = {}) => {
    let {
      // eslint-disable-next-line no-unused-vars
      uplink // mutable
    } = form
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x']),
      label: i18n.t('Dynamic Uplinks'),
      text: i18n.t('Dynamically lookup uplinks.'),
      cols: [
        {
          namespace: 'uplink_dynamic',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'dynamic', unchecked: 'static', default: placeholder(meta, 'uplink_dynamic') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'uplink_dynamic') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: (placeholder(meta, 'uplink_dynamic') === 'dynamic') ? 'Y' : 'N' }) }
          },
          listeners: {
            checked: () => {
              uplink = null // clear uplink
            }
          }
        }
      ]
    }
  },
  UrlMap: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['ExternalPortal']),
      label: i18n.t('Role by Web Auth URL'),
      cols: [
        {
          namespace: 'UrlMap',
          component: pfFormRangeToggleDefault,
          attrs: {
            tooltip: false,
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'UrlMap') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'UrlMap') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'UrlMap') }) }
          }
        }
      ]
    }
  },
  useCoA: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Use CoA'),
      text: i18n.t('Use CoA when available to deauthenticate the user. When disabled, RADIUS Disconnect will be used instead if it is available.'),
      cols: [
        {
          namespace: 'useCoA',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'useCoA') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'useCoA') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'useCoA') }) }
          }
        }
      ]
    }
  },
  VlanMap: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['RadiusDynamicVlanAssignment']),
      label: i18n.t('Role by VLAN ID'),
      cols: [
        {
          namespace: 'VlanMap',
          component: pfFormRangeToggleDefault,
          attrs: {
            tooltip: false,
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'VlanMap') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'VlanMap') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'VlanMap') }) }
          }
        }
      ]
    }
  },
  VoIPCDPDetect: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['Cdp']),
      label: i18n.t('VoIPCDPDetect'),
      text: i18n.t('Detect VoIP with a SNMP request in the CDP MIB.'),
      cols: [
        {
          namespace: 'VoIPCDPDetect',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'VoIPCDPDetect') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'VoIPCDPDetect') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'VoIPCDPDetect') }) }
          }
        }
      ]
    }
  },
  VoIPDHCPDetect: (form = {}, meta = {}) => {
    return {
      label: i18n.t('VoIPDHCPDetect'),
      text: i18n.t('Detect VoIP with the DHCP Fingerprint.'),
      cols: [
        {
          namespace: 'VoIPDHCPDetect',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'VoIPDHCPDetect') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'VoIPDHCPDetect') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'VoIPDHCPDetect') }) }
          }
        }
      ]
    }
  },
  VoIPEnabled: (form = {}, meta = {}) => {
    return {
      label: i18n.t('VOIP'),
      cols: [
        {
          namespace: 'VoIPEnabled',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'VoIPEnabled') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'VoIPEnabled') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'VoIPEnabled') }) }
          }
        }
      ]
    }
  },
  VoIPLLDPDetect: (form = {}, meta = {}) => {
    const {
      advancedMode = false
    } = meta
    return {
      if: advancedMode || supports(form, meta, ['Lldp']),
      label: i18n.t('VoIPLLDPDetect'),
      text: i18n.t('Detect VoIP with a SNMP request in the LLDP MIB.'),
      cols: [
        {
          namespace: 'VoIPLLDPDetect',
          component: pfFormRangeToggleDefault,
          attrs: {
            values: { checked: 'Y', unchecked: 'N', default: placeholder(meta, 'VoIPLLDPDetect') },
            icons: { checked: 'check', unchecked: 'times' },
            colors: { checked: 'var(--primary)', default: (placeholder(meta, 'VoIPLLDPDetect') === 'Y') ? 'var(--primary)' : '' },
            tooltips: { checked: i18n.t('Y'), unchecked: i18n.t('N'), default: i18n.t('Default ({default})', { default: placeholder(meta, 'VoIPLLDPDetect') }) }
          }
        }
      ]
    }
  },
  wsPwd: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Password'),
      cols: [
        {
          namespace: 'wsPwd',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'wsPwd')
        }
      ]
    }
  },
  wsTransport: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Transport'),
      cols: [
        {
          namespace: 'wsTransport',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'wsTransport')
        }
      ]
    }
  },
  wsUser: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Username'),
      cols: [
        {
          namespace: 'wsUser',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'wsUser')
        }
      ]
    }
  }
}

export const view = (form = {}, meta = {}) => {
  const {
    advancedMode = false
  } = meta
  return [
    {
      tab: i18n.t('Definition'),
      rows: [
        viewFields.id(form, meta),
        viewFields.description(form, meta),
        viewFields.type(form, meta),
        viewFields.mode(form, meta),
        viewFields.group(form, meta),
        viewFields.deauthMethod(form, meta),
        viewFields.useCoA(form, meta),
        viewFields.cliAccess(form, meta),
        viewFields.ExternalPortalEnforcement(form, meta),
        viewFields.VoIPEnabled(form, meta),
        viewFields.VoIPLLDPDetect(form, meta),
        viewFields.VoIPCDPDetect(form, meta),
        viewFields.VoIPDHCPDetect(form, meta),
        viewFields.uplink_dynamic(form, meta),
        viewFields.uplink(form, meta),
        viewFields.controllerIp(form, meta),
        viewFields.disconnectPort(form, meta),
        viewFields.coaPort(form, meta)
      ]
    },
    {
      tab: i18n.t('Roles'),
      rows: [
        {
          if: advancedMode || supports(form, meta, ['RadiusDynamicVlanAssignment']),
          label: i18n.t('Role mapping by VLAN ID'),
          labelSize: 'lg'
        },
        viewFields.VlanMap(form, meta),
        ...viewFields.mapVlan(form, meta),
        {
          if: advancedMode || supports(form, meta, ['RoleBasedEnforcement']),
          label: i18n.t('Role mapping by Switch Role'),
          labelSize: 'lg'
        },
        viewFields.RoleMap(form, meta),
        ...viewFields.mapRole(form, meta),
        {
          if: advancedMode || supports(form, meta, ['AccessListBasedEnforcement']),
          label: i18n.t('Role mapping by Access List'),
          labelSize: 'lg'
        },
        viewFields.AccessListMap(form, meta),
        ...viewFields.mapAccessList(form, meta),
        {
          if: advancedMode || supports(form, meta, ['ExternalPortal']),
          label: i18n.t('Role mapping by Web Auth URL'),
          labelSize: 'lg'
        },
        viewFields.UrlMap(form, meta),
        ...viewFields.mapUrl(form, meta)
      ]
    },
    {
      tab: i18n.t('Inline'),
      rows: [
        viewFields.inlineTrigger(form, meta)
      ]
    },
    {
      if: advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x', 'WirelessMacAuth', 'WirelessDot1x', 'VPN']),
      tab: i18n.t('RADIUS'),
      rows: [
        viewFields.radiusSecret(form, meta)
      ]
    },
    {
      tab: i18n.t('SNMP'),
      rows: [
        viewFields.SNMPVersion(form, meta),
        viewFields.SNMPCommunityRead(form, meta),
        viewFields.SNMPCommunityWrite(form, meta),
        viewFields.SNMPEngineID(form, meta),
        viewFields.SNMPUserNameRead(form, meta),
        viewFields.SNMPAuthProtocolRead(form, meta),
        viewFields.SNMPAuthPasswordRead(form, meta),
        viewFields.SNMPPrivProtocolRead(form, meta),
        viewFields.SNMPPrivPasswordRead(form, meta),
        viewFields.SNMPUserNameWrite(form, meta),
        viewFields.SNMPAuthProtocolWrite(form, meta),
        viewFields.SNMPAuthPasswordWrite(form, meta),
        viewFields.SNMPPrivProtocolWrite(form, meta),
        viewFields.SNMPPrivPasswordWrite(form, meta),
        viewFields.SNMPVersionTrap(form, meta),
        viewFields.SNMPCommunityTrap(form, meta),
        viewFields.SNMPUserNameTrap(form, meta),
        viewFields.SNMPAuthProtocolTrap(form, meta),
        viewFields.SNMPAuthPasswordTrap(form, meta),
        viewFields.SNMPPrivProtocolTrap(form, meta),
        viewFields.SNMPPrivPasswordTrap(form, meta),
        viewFields.macSearchesMaxNb(form, meta),
        viewFields.macSearchesSleepInterval(form, meta)
      ]
    },
    {
      tab: i18n.t('CLI'),
      rows: [
        viewFields.cliTransport(form, meta),
        viewFields.cliUser(form, meta),
        viewFields.cliPwd(form, meta),
        viewFields.cliEnablePwd(form, meta)
      ]
    },
    {
      tab: i18n.t('Web Services'),
      rows: [
        viewFields.wsTransport(form, meta),
        viewFields.wsUser(form, meta),
        viewFields.wsPwd(form, meta)
      ]
    }
  ]
}

export const validators = (form = {}, meta = {}) => {
  const {
    id,
    uplink_dynamic: uplinkDynamic,
    VlanMap,
    RoleMap,
    AccessListMap,
    UrlMap,
    inlineTrigger = []
  } = form
  const {
    isNew = false,
    isClone = false,
    roles = [],
    advancedMode = false
  } = meta
  return {
    ...{
      ...[
        { id: 'registration', label: i18n.t('registration') },
        { id: 'isolation', label: i18n.t('isolation') },
        { id: 'macDetection', label: i18n.t('macDetection') },
        { id: 'inline', label: i18n.t('inline') },
        ...roles
      ].reduce((validators, role) => {
        return {
          ...validators,
          ...{
            ...((advancedMode || (supports(form, meta, ['RadiusDynamicVlanAssignment']) && (VlanMap === 'Y' || (!VlanMap && placeholder(meta, 'VlanMap') === 'Y'))))
              ? { [`${role.id}Vlan`]: pfConfigurationValidatorsFromMeta(meta, `${role.id}Vlan`, 'VLAN') }
              : {}
            ),
            ...((advancedMode || (supports(form, meta, ['RoleBasedEnforcement']) && (RoleMap === 'Y' || (!RoleMap && placeholder(meta, 'RoleMap') === 'Y'))))
              ? { [`${role.id}Role`]: pfConfigurationValidatorsFromMeta(meta, `${role.id}Role`, i18n.t('Role')) }
              : {}
            ),
            ...((advancedMode || (supports(form, meta, ['AccessListBasedEnforcement']) && (AccessListMap === 'Y' || (!AccessListMap && placeholder(meta, 'AccessListMap') === 'Y'))))
              ? { [`${role.id}AccessList`]: pfConfigurationValidatorsFromMeta(meta, `${role.id}AccessList`, i18n.t('List')) }
              : {}
            ),
            ...((advancedMode || (supports(form, meta, ['ExternalPortal']) && (UrlMap === 'Y' || (!UrlMap && placeholder(meta, 'UrlMap') === 'Y'))))
              ? { [`${role.id}Url`]: pfConfigurationValidatorsFromMeta(meta, `${role.id}Url`, 'URL') }
              : {}
            )
          }
        }
      }, {})
    },
    ...{
      ...(((advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x'])) && ((uplinkDynamic && uplinkDynamic !== 'dynamic') || (!uplinkDynamic && placeholder(meta, 'uplink_dynamic') !== 'dynamic')))
        ? {
          uplink: {
            ...pfConfigurationValidatorsFromMeta(meta, 'uplink', i18n.t('Uplinks')),
            ...{
              [i18n.t('Uplinks required.')]: required
            }
          }
        }
        : {}
      ),
      ...((advancedMode || supports(form, meta, ['WirelessMacAuth', 'WirelessDot1x']))
        ? {
          controllerIp: pfConfigurationValidatorsFromMeta(meta, 'controllerIp', 'IP')
        }
        : {}
      ),
      ...((advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x', 'WirelessMacAuth', 'WirelessDot1x']))
        ? {
          disconnectPort: pfConfigurationValidatorsFromMeta(meta, 'disconnectPort', i18n.t('Port'))
        }
        : {}
      ),
      ...((advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x', 'WirelessMacAuth', 'WirelessDot1x']))
        ? {
          coaPort: pfConfigurationValidatorsFromMeta(meta, 'coaPort', i18n.t('Port'))
        }
        : {}
      ),
      ...((advancedMode || supports(form, meta, ['WiredMacAuth', 'WiredDot1x', 'WirelessMacAuth', 'WirelessDot1x', 'VPN']))
        ? {
          radiusSecret: pfConfigurationValidatorsFromMeta(meta, 'radiusSecret', i18n.t('Secret'))
        }
        : {}
      )
    },
    ...{
      id: {
        ...pfConfigurationValidatorsFromMeta(meta, 'id', 'ID'),
        ...{
          [i18n.t('Switch exists.')]: not(and(required, conditional(isNew || isClone), hasSwitches, switchExists))
        }
      },
      description: {
        ...pfConfigurationValidatorsFromMeta(meta, 'description', i18n.t('Description')),
        ...{
          [i18n.t('Description required.')]: or(required, conditional(id === 'default'))
        }
      },
      inlineTrigger: {
        ...(inlineTrigger || []).map(_inlineTrigger => { // index based inlineTrigger validators
          if (_inlineTrigger) {
            const { type } = _inlineTrigger
            if (type) {
              const { [type]: { validators: { type: typeValidators = {}, value: valueValidators = {} } = {} } = {} } = inlineTriggers
              if (validators) {
                return {
                  type: {
                    ...{
                      [i18n.t('Trigger condition.')]: required,
                      [i18n.t('Duplicate condition.')]: conditional((type) => !(inlineTrigger.filter(trigger => trigger && trigger.type === type).length > 1)),
                      [i18n.t('Condition conflicts with "Always".')]: conditional((type) => !(type !== 'always' && inlineTrigger.filter(trigger => trigger && trigger.type === 'always').length > 0))
                    },
                    ...typeValidators
                  },
                  value: {
                    ...{
                      [i18n.t('Value required.')]: conditional((value) => !(type !== 'always' && !value)),
                      [i18n.t('Maximum 255 characters.')]: maxLength(255)
                    },
                    ...valueValidators
                  }
                }
              }
            }
          }
          return {
            type: {
              [i18n.t('Condition required.')]: required
            }
          }
        })
      },
      type: pfConfigurationValidatorsFromMeta(meta, 'type', i18n.t('Type')),
      mode: pfConfigurationValidatorsFromMeta(meta, 'mode', i18n.t('Mode')),
      group: pfConfigurationValidatorsFromMeta(meta, 'group', i18n.t('Group')),
      deauthMethod: pfConfigurationValidatorsFromMeta(meta, 'deauthMethod', i18n.t('Method')),
      SNMPVersion: pfConfigurationValidatorsFromMeta(meta, 'SNMPVersion', i18n.t('Version')),
      SNMPCommunityRead: pfConfigurationValidatorsFromMeta(meta, 'SNMPCommunityRead'),
      SNMPCommunityWrite: pfConfigurationValidatorsFromMeta(meta, 'SNMPCommunityWrite'),
      SNMPEngineID: pfConfigurationValidatorsFromMeta(meta, 'SNMPEngineID'),
      SNMPUserNameRead: pfConfigurationValidatorsFromMeta(meta, 'SNMPUserNameRead'),
      SNMPAuthProtocolRead: pfConfigurationValidatorsFromMeta(meta, 'SNMPAuthProtocolRead'),
      SNMPAuthPasswordRead: pfConfigurationValidatorsFromMeta(meta, 'SNMPAuthPasswordRead'),
      SNMPPrivProtocolRead: pfConfigurationValidatorsFromMeta(meta, 'SNMPPrivProtocolRead'),
      SNMPPrivPasswordRead: pfConfigurationValidatorsFromMeta(meta, 'SNMPPrivPasswordRead'),
      SNMPUserNameWrite: pfConfigurationValidatorsFromMeta(meta, 'SNMPUserNameWrite'),
      SNMPAuthProtocolWrite: pfConfigurationValidatorsFromMeta(meta, 'SNMPAuthProtocolWrite'),
      SNMPAuthPasswordWrite: pfConfigurationValidatorsFromMeta(meta, 'SNMPAuthPasswordWrite'),
      SNMPPrivProtocolWrite: pfConfigurationValidatorsFromMeta(meta, 'SNMPPrivProtocolWrite'),
      SNMPPrivPasswordWrite: pfConfigurationValidatorsFromMeta(meta, 'SNMPPrivPasswordWrite'),
      SNMPVersionTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPVersionTrap'),
      SNMPCommunityTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPCommunityTrap'),
      SNMPUserNameTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPUserNameTrap'),
      SNMPAuthProtocolTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPAuthProtocolTrap'),
      SNMPAuthPasswordTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPAuthPasswordTrap'),
      SNMPPrivProtocolTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPPrivProtocolTrap'),
      SNMPPrivPasswordTrap: pfConfigurationValidatorsFromMeta(meta, 'SNMPPrivPasswordTrap'),
      macSearchesMaxNb: pfConfigurationValidatorsFromMeta(meta, 'macSearchesMaxNb', i18n.t('Max')),
      macSearchesSleepInterval: pfConfigurationValidatorsFromMeta(meta, 'macSearchesSleepInterval', i18n.t('Interval')),
      cliTransport: pfConfigurationValidatorsFromMeta(meta, 'cliTransport', i18n.t('Transport')),
      cliUser: pfConfigurationValidatorsFromMeta(meta, 'cliUser', i18n.t('Username')),
      cliPwd: pfConfigurationValidatorsFromMeta(meta, 'cliPwd', i18n.t('Password')),
      cliEnablePwd: pfConfigurationValidatorsFromMeta(meta, 'cliEnablePwd', i18n.t('Password')),
      wsTransport: pfConfigurationValidatorsFromMeta(meta, 'wsTransport', i18n.t('Transport')),
      wsUser: pfConfigurationValidatorsFromMeta(meta, 'wsUser', i18n.t('Username')),
      wsPwd: pfConfigurationValidatorsFromMeta(meta, 'wsPwd', i18n.t('Password'))
    }
  }
}
