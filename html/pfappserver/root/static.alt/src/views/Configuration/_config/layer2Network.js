import i18n from '@/utils/locale'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormHtml from '@/components/pfFormHtml'
import pfFormInput from '@/components/pfFormInput'
import pfFormTextarea from '@/components/pfFormTextarea'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import {
  and,
  not,
  conditional,
  hasLayer2Networks,
  layer2NetworkExists,
  isFQDN
} from '@/globals/pfValidators'
import {
  required,
  ipAddress
} from '@/globals/pfValidators'

export const htmlNote = `<div class="alert alert-warning">
  <strong>${i18n.t('Note')}</strong>
  ${i18n.t('Adding or modifying a network requires a restart of the pfdhcp and pfdns services for the changes to take place.')}
</div>`

export const dhcpList = [
  { value: '1', text: i18n.t('Random') },
  { value: '2', text: i18n.t('Oldest Released') }
]

export const columns = [
  {
    key: 'id',
    label: i18n.t('Network'),
    sortable: false,
    visible: true
  },
  {
    key: 'algorithm',
    label: i18n.t('Algorithm'),
    sortable: true,
    visible: true
  },
  {
    key: 'dhcp_start',
    label: i18n.t('Starting IP Address'),
    sortable: true,
    visible: true
  },
  {
    key: 'dhcp_end',
    label: i18n.t('Ending IP Address'),
    sortable: true,
    visible: true
  },
  {
    key: 'dhcp_default_lease_time',
    label: i18n.t('Default Lease Time'),
    sortable: true,
    visible: true
  },
  {
    key: 'dhcp_max_lease_time',
    label: i18n.t('Max Lease Time'),
    sortable: true,
    visible: true
  },
  {
    key: 'portal_fqdn',
    label: i18n.t('Portal FQDN'),
    sortable: true,
    visible: true
  }
]

export const view = (form = {}, meta = {}) => {
  const {
    fake_mac_enabled
  } = form
  const {
    isNew = false
  } = meta
  return [
    {
      tab: null,
      rows: [
        {
          label: i18n.t('Layer2 Network'),
          cols: [
            {
              namespace: 'id',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'id'),
                ...{
                  disabled: (!isNew)
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Algorithm'),
          cols: [
            {
              namespace: 'algorithm',
              component: pfFormChosen,
              attrs: {
                collapseObject: true,
                placeholder: i18n.t('Click to choose the algorithm'),
                trackBy: 'value',
                label: 'text',
                options: dhcpList
              }
            }
          ]
        },
        {
          label: i18n.t('Starting IP Address'),
          cols: [
            {
              namespace: 'dhcp_start',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'dhcp_start'),
                ...{
                  disabled: (fake_mac_enabled === '1')
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Ending IP Address'),
          cols: [
            {
              namespace: 'dhcp_end',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'dhcp_start'),
                ...{
                  disabled: (fake_mac_enabled === '1')
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Default Lease Time'),
          cols: [
            {
              namespace: 'dhcp_default_lease_time',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'dhcp_default_lease_time'),
                ...{
                  disabled: (fake_mac_enabled === '1')
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Max Lease Time'),
          cols: [
            {
              namespace: 'dhcp_max_lease_time',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'dhcp_max_lease_time'),
                ...{
                  disabled: (fake_mac_enabled === '1')
                }
              }
            }
          ]
        },
        {
          label: i18n.t('IP Addresses reserved'),
          text: i18n.t('Range like 192.168.0.1-192.168.0.20 and or IP like 192.168.0.22,192.168.0.24 will be excluded from the DHCP pool.'),
          cols: [
            {
              namespace: 'ip_reserved',
              component: pfFormTextarea,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'ip_reserved'),
                ...{
                  disabled: (fake_mac_enabled === '1'),
                  rows: 5
                }
              }
            }
          ]
        },
        {
          label: i18n.t('IP Addresses assigned'),
          text: i18n.t('List like 00:11:22:33:44:55:192.168.0.12,11:22:33:44:55:66:192.168.0.13.'),
          cols: [
            {
              namespace: 'ip_assigned',
              component: pfFormTextarea,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'ip_assigned'),
                ...{
                  disabled: (fake_mac_enabled === '1'),
                  rows: 5
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Portal FQDN'),
          text: i18n.t('Define the FQDN of the portal for this network. Leaving empty will use the FQDN of the PacketFence server.'),
          cols: [
            {
              namespace: 'portal_fqdn',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'portal_fqdn'),
                ...{
                  disabled: (fake_mac_enabled === '1')
                }
              }
            }
          ]
        },
        {
          label: null, /* no label */
          cols: [
            {
              component: pfFormHtml,
              attrs: {
                html: htmlNote
              }
            }
          ]
        }
      ]
    }
  ]
}
export const validators = (form = {}, meta = {}) => {
  const {
    isNew = false
  } = meta
  return {
    id: {
      ...pfConfigurationValidatorsFromMeta(meta, 'id', 'ID'),
      ...{
        [i18n.t('Network exists.')]: not(and(required, conditional(isNew), hasLayer2Networks, layer2NetworkExists)),
        [i18n.t('Invalid IP Address.')]: ipAddress
      }
    },
    algorithm: pfConfigurationValidatorsFromMeta(meta, 'algorithm', i18n.t('Algorithm')),
    dhcp_start: {
      ...pfConfigurationValidatorsFromMeta(meta, 'dhcp_start', 'IP'),
      ...{
        [i18n.t('Invalid IP Address.')]: ipAddress
      }
    },
    dhcp_end: {
      ...pfConfigurationValidatorsFromMeta(meta, 'dhcp_end', 'IP'),
      ...{
        [i18n.t('Invalid IP Address.')]: ipAddress
      }
    },
    dhcp_default_lease_time: pfConfigurationValidatorsFromMeta(meta, 'dhcp_default_lease_time', i18n.t('Time')),
    dhcp_max_lease_time: pfConfigurationValidatorsFromMeta(meta, 'dhcp_max_lease_time', i18n.t('Time')),
    ip_reserved: pfConfigurationValidatorsFromMeta(meta, 'ip_reserved', i18n.t('Addresses')),
    ip_assigned: pfConfigurationValidatorsFromMeta(meta, 'ip_assigned', i18n.t('Addresses')),
    portal_fqdn: {
      ...pfConfigurationValidatorsFromMeta(meta, 'portal_fqdn', 'FQDN'),
      ...{
        [i18n.t('Invalid FQDN.')]: isFQDN
      }
    }
  }
}
