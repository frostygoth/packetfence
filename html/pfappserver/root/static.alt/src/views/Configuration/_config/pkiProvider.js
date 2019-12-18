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
  hasPkiProviders,
  pkiProviderExists
} from '@/globals/pfValidators'
import {
  required
} from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'id',
    label: i18n.t('Name'),
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
    text: i18n.t('Name'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'description',
    text: i18n.t('Description'),
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
      return { name: 'pki_provider', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by name or description'),
    searchableOptions: {
      searchApiEndpoint: 'config/pki_providers',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'description', op: 'contains', value: null },
            { field: 'type', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'pki_providers' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: quickCondition },
            { field: 'description', op: 'contains', value: quickCondition },
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
    providerType = null
  } = meta
  return [
    {
      tab: null,
      rows: [
        {
          label: i18n.t('PKI Provider Name'),
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
          if: ['scep'].includes(providerType),
          label: 'URL',
          text: i18n.t('The url used to connect to the SCEP PKI service.'),
          cols: [
            {
              namespace: 'url',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'url')
            }
          ]
        },
        {
          if: ['packetfence_pki'].includes(providerType),
          label: i18n.t('Protocol'),
          text: i18n.t('Protocol to use to contact the PacketFence PKI API.'),
          cols: [
            {
              namespace: 'proto',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'proto')
            }
          ]
        },
        {
          if: ['packetfence_pki'].includes(providerType),
          label: i18n.t('Host'),
          text: i18n.t('Host which hosts the PacketFence PKI.'),
          cols: [
            {
              namespace: 'host',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'host')
            }
          ]
        },
        {
          if: ['packetfence_pki'].includes(providerType),
          label: i18n.t('Port'),
          text: i18n.t('Port on which to contact the PacketFence PKI API.'),
          cols: [
            {
              namespace: 'port',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'port')
            }
          ]
        },
        {
          if: ['packetfence_pki'].includes(providerType),
          label: i18n.t('Username'),
          text: i18n.t('Username to connect to the PKI.'),
          cols: [
            {
              namespace: 'username',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'username')
            }
          ]
        },
        {
          if: ['scep'].includes(providerType),
          label: i18n.t('Username'),
          text: i18n.t('Username to connect to the SCEP PKI Service.'),
          cols: [
            {
              namespace: 'username',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'username')
            }
          ]
        },
        {
          if: ['packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('Password'),
          text: i18n.t('Password for the username filled in above.'),
          cols: [
            {
              namespace: 'password',
              component: pfFormPassword,
              attrs: pfConfigurationAttributesFromMeta(meta, 'password')
            }
          ]
        },
        {
          if: ['packetfence_pki'].includes(providerType),
          label: i18n.t('Profile'),
          text: i18n.t('Profile used for the generation of certificate.'),
          cols: [
            {
              namespace: 'profile',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'profile')
            }
          ]
        },
        {
          if: ['packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('Country'),
          text: i18n.t('Country for the certificate.'),
          cols: [
            {
              namespace: 'country',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'country')
            }
          ]
        },
        {
          if: ['packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('State'),
          text: i18n.t('State for the certificate.'),
          cols: [
            {
              namespace: 'state',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'state')
            }
          ]
        },
        {
          if: ['scep'].includes(providerType),
          label: i18n.t('Locality'),
          text: i18n.t('Locality for the certificate.'),
          cols: [
            {
              namespace: 'locality',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'locality')
            }
          ]
        },
        {
          if: ['packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('Organization'),
          text: i18n.t('Organization for the certificate.'),
          cols: [
            {
              namespace: 'organization',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'organization')
            }
          ]
        },
        {
          if: ['scep'].includes(providerType),
          label: i18n.t('Organizational unit'),
          text: i18n.t('Organizational unit for the certificate.'),
          cols: [
            {
              namespace: 'organizational_unit',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'organizational_unit')
            }
          ]
        },
        {
          if: ['packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('Common Name Attribute'),
          text: i18n.t('Defines what attribute of the node to use as the common name during the certificate generation.'),
          cols: [
            {
              namespace: 'cn_attribute',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'cn_attribute')
            }
          ]
        },
        {
          if: ['packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('Common Name Format'),
          text: i18n.t('Defines how the common name will be formated. %s will expand to the defined Common Name Attribute value.'),
          cols: [
            {
              namespace: 'cn_format',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'cn_format')
            }
          ]
        },
        {
          if: ['packetfence_pki'].includes(providerType),
          label: i18n.t('Revoke on unregistration'),
          text: i18n.t('Check this box to have the certificate revoke when the node using it is unregistered. Do not use if multiple devices share the same certificate.'),
          cols: [
            {
              namespace: 'revoke_on_unregistration',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'Y', unchecked: 'N' }
              }
            }
          ]
        },
        {
          if: ['packetfence_local'].includes(providerType),
          label: i18n.t('Client cert path'),
          text: i18n.t('Path of the client cert that will be used to generate the p12.'),
          cols: [
            {
              namespace: 'client_cert_path',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'client_cert_path')
            }
          ]
        },
        {
          if: ['packetfence_local'].includes(providerType),
          label: i18n.t('Client key path'),
          text: i18n.t('Path of the client key that will be used to generate the p12.'),
          cols: [
            {
              namespace: 'client_key_path',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'client_key_path')
            }
          ]
        },
        {
          if: ['packetfence_local', 'packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('CA cert path'),
          text: i18n.t('Path of the CA certificate used to generate client certificate/key combination.'),
          cols: [
            {
              namespace: 'ca_cert_path',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'ca_cert_path')
            }
          ]
        },
        {
          if: ['packetfence_local', 'packetfence_pki', 'scep'].includes(providerType),
          label: i18n.t('Server cert path'),
          text: i18n.t('Path of the RADIUS server authentication certificate.'),
          cols: [
            {
              namespace: 'server_cert_path',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'server_cert_path')
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
      ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
      ...{
        [i18n.t('PKI Provider exists.')]: not(and(required, conditional(isNew || isClone), hasPkiProviders, pkiProviderExists))
      }
    },
    url: pfConfigurationValidatorsFromMeta(meta, 'url', 'URL'),
    proto: pfConfigurationValidatorsFromMeta(meta, 'proto', i18n.t('Protocol')),
    host: pfConfigurationValidatorsFromMeta(meta, 'host', i18n.t('Host')),
    port: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port')),
    username: pfConfigurationValidatorsFromMeta(meta, 'username', i18n.t('Username')),
    password: pfConfigurationValidatorsFromMeta(meta, 'password', i18n.t('Password')),
    profile: pfConfigurationValidatorsFromMeta(meta, 'profile', i18n.t('Profile')),
    country: pfConfigurationValidatorsFromMeta(meta, 'country', i18n.t('Country')),
    state: pfConfigurationValidatorsFromMeta(meta, 'state', i18n.t('State')),
    locality: pfConfigurationValidatorsFromMeta(meta, 'locality', i18n.t('Locality')),
    organization: pfConfigurationValidatorsFromMeta(meta, 'organization', i18n.t('Organization')),
    organizational_unit: pfConfigurationValidatorsFromMeta(meta, 'organizational_unit', i18n.t('Unit')),
    cn_attribute: pfConfigurationValidatorsFromMeta(meta, 'cn_attribute', i18n.t('Attribute')),
    cn_format: pfConfigurationValidatorsFromMeta(meta, 'cn_format', i18n.t('Format')),
    client_cert_path: pfConfigurationValidatorsFromMeta(meta, 'client_cert_path', i18n.t('Path')),
    client_key_path: pfConfigurationValidatorsFromMeta(meta, 'client_key_path', i18n.t('Path')),
    ca_cert_path: pfConfigurationValidatorsFromMeta(meta, 'ca_cert_path', i18n.t('Path')),
    server_cert_path: pfConfigurationValidatorsFromMeta(meta, 'server_cert_path', i18n.t('Path'))
  }
}
