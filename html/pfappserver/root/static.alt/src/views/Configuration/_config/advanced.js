import i18n from '@/utils/locale'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormInput from '@/components/pfFormInput'
import pfFormRangeToggle from '@/components/pfFormRangeToggle'
import pfFormTextarea from '@/components/pfFormTextarea'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import {
  requiredIf
} from 'vuelidate/lib/validators'

export const view = (form = {}, meta = {}) => {
  return [
    {
      tab: null,
      rows: [
        {
          label: i18n.t('Language of communication'),
          text: i18n.t('Language choice for the communication with administrators.'),
          cols: [
            {
              namespace: 'language',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'language')
            }
          ]
        },
        {
          label: i18n.t('API inactivity timeout'),
          text: i18n.t('The inactivity timeout of an API token. Requires to restart the api-frontend service to be fully effective.'),
          cols: [
            {
              namespace: 'api_inactivity_timeout.interval',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'api_inactivity_timeout.interval')
            },
            {
              namespace: 'api_inactivity_timeout.unit',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'api_inactivity_timeout.unit')
            }
          ]
        },
        {
          label: i18n.t('API token max expiration'),
          text: i18n.t('The maximum amount of time an API token can be valid. Requires to restart the api-frontend service to be fully effective.'),
          cols: [
            {
              namespace: 'api_max_expiration.interval',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'api_max_expiration.interval')
            },
            {
              namespace: 'api_max_expiration.unit',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'api_max_expiration.unit')
            }
          ]
        },
        {
          label: i18n.t('CSP headers for Admin'),
          text: i18n.t('(Experimental) Enforce Content-Security-Policy (CSP) HTTP response header in admin interface.'),
          cols: [
            {
              namespace: 'admin_csp_security_headers',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('CSP headers for Captive portal'),
          text: i18n.t('(Experimental) Enforce Content-Security-Policy (CSP) HTTP response header in captive portal interface.'),
          cols: [
            {
              namespace: 'portal_csp_security_headers',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('SSO on access reevaluation'),
          text: i18n.t('Trigger Single-Sign-On (Firewall SSO) on access reevaluation.'),
          cols: [
            {
              namespace: 'sso_on_access_reevaluation',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Scan on accounting'),
          text: i18n.t('Trigger scan engines on accounting.'),
          cols: [
            {
              namespace: 'scan_on_accounting',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('SSO on accounting'),
          text: i18n.t('Trigger Single-Sign-On (Firewall SSO) on accounting.'),
          cols: [
            {
              namespace: 'sso_on_accounting',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('SSO on DHCP'),
          text: i18n.t('Trigger Single-Sign-On (Firewall SSO) on dhcp.'),
          cols: [
            {
              namespace: 'sso_on_dhcp',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Database passwords hashing method'),
          text: i18n.t('The algorithm used to hash the passwords in the database. This will only affect newly created or reset passwords.'),
          cols: [
            {
              namespace: 'hash_passwords',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'hash_passwords')
            }
          ]
        },
        {
          label: i18n.t('Hashing Cost'),
          text: i18n.t('The cost factor to apply to the password hashing if applicable. Currently only applies to bcrypt.'),
          cols: [
            {
              namespace: 'hashing_cost',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'hashing_cost')
            }
          ]
        },
        {
          label: i18n.t('LDAP Attributes'),
          text: i18n.t('List of LDAP attributes that can be used in the sources configuration.'),
          cols: [
            {
              namespace: 'ldap_attributes',
              component: pfFormTextarea,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'ldap_attributes'),
                ...{
                  placeholderHtml: true,
                  labelHtml: i18n.t('Built-in LDAP Attributes'),
                  rows: 3
                }
              }
            }
          ]
        },
        {
          label: i18n.t('PfFilter Processes'),
          text: i18n.t(`Amount of pffilter processes to start.`),
          cols: [
            {
              namespace: 'pffilter_processes',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'pffilter_processes'),
                ...{
                  type: 'number',
                  step: 1
                }
              }
            }
          ]
        },
        {
          label: i18n.t('PfPerl API Processes'),
          text: i18n.t(`Amount of pfperl-api processes to start.`),
          cols: [
            {
              namespace: 'pfperl_api_processes',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'pfperl_api_processes'),
                ...{
                  type: 'number',
                  step: 1
                }
              }
            }
          ]
        },
        {
          label: i18n.t('PfPerl API Timeout'),
          text: i18n.t(`The timeout in seconds for an API request.`),
          cols: [
            {
              namespace: 'pfperl_api_timeout',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'pfperl_api_timeout'),
                ...{
                  type: 'number',
                  step: 1
                }
              }
            }
          ]
        },
        {
          label: i18n.t('Update the iplog using the accounting'),
          text: i18n.t('Use the information included in the accounting to update the iplog.'),
          cols: [
            {
              namespace: 'update_iplog_with_accounting',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Close locationlog on accounting stop'),
          text: i18n.t('Close the locationlog for a node on accounting stop.'),
          cols: [
            {
              namespace: 'locationlog_close_on_accounting_stop',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Stats timing level'),
          text: i18n.t(`Level of timing stats to keep - 0 is the lowest - 10 the highest amount to log. Do not change unless you know what you are doing.`),
          cols: [
            {
              namespace: 'timing_stats_level',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'timing_stats_level')
            }
          ]
        },
        {
          label: i18n.t('SMS Source for sending user create messages'),
          text: i18n.t('The source to use to send an SMS when creating a user.'),
          cols: [
            {
              namespace: 'source_to_send_sms_when_creating_users',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'source_to_send_sms_when_creating_users')
            }
          ]
        },
        {
          label: i18n.t('Multihost'),
          text: i18n.t('Ability to manage all active devices from a same switch port.'),
          cols: [
            {
              namespace: 'multihost',
              component: pfFormRangeToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          label: i18n.t('Disable OS AD join check'),
          text: i18n.t('Enable to bypass the operating system domain join verification.'),
          cols: [
            {
              namespace: 'active_directory_os_join_check_bypass',
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


export const validators = (form = {}, meta = {}) => {
  const {
    api_inactivity_timeout = { unit: null, interval: null },
    api_max_expiration = { unit: null, interval: null }
  } = form
  return {
    language: pfConfigurationValidatorsFromMeta(meta, 'language', i18n.t('Language')),
    api_inactivity_timeout: {
      interval: {
        ...pfConfigurationValidatorsFromMeta(meta, 'api_inactivity_timeout.interval', i18n.t('Interval')),
        ...{
          [i18n.t('Interval required.')]: requiredIf(() => api_inactivity_timeout.unit !== null)
        }
      },
      unit: {
        ...pfConfigurationValidatorsFromMeta(meta, 'api_inactivity_timeout.unit', i18n.t('Unit')),
        ...{
          [i18n.t('Unit required.')]: requiredIf(() => api_inactivity_timeout.interval !== null)
        }
      }
    },
    api_max_expiration: {
      interval: {
        ...pfConfigurationValidatorsFromMeta(meta, 'api_max_expiration.interval', i18n.t('Interval')),
        ...{
          [i18n.t('Interval required.')]: requiredIf(() => api_max_expiration.unit !== null)
        }
      },
      unit: {
        ...pfConfigurationValidatorsFromMeta(meta, 'api_max_expiration.unit', i18n.t('Unit')),
        ...{
          [i18n.t('Unit required.')]: requiredIf(() => api_max_expiration.interval !== null)
        }
      }
    },
    hash_passwords: pfConfigurationValidatorsFromMeta(meta, 'hash_passwords', i18n.t('Method')),
    hashing_cost: pfConfigurationValidatorsFromMeta(meta, 'hashing_cost', i18n.t('Cost')),
    ldap_attributes: pfConfigurationValidatorsFromMeta(meta, 'ldap_attributes', i18n.t('Attributes')),
    pffilter_processes: pfConfigurationValidatorsFromMeta(meta, 'pffilter_processes', i18n.t('Processes')),
    pfperl_api_processes: pfConfigurationValidatorsFromMeta(meta, 'pfperl_api_processes', i18n.t('Processes')),
    pfperl_api_timeout: pfConfigurationValidatorsFromMeta(meta, 'pfperl_api_timeout', i18n.t('Timeout')),
    timing_stats_level: pfConfigurationValidatorsFromMeta(meta, 'timing_stats_level', i18n.t('Level')),
    source_to_send_sms_when_creating_users: pfConfigurationValidatorsFromMeta(meta, 'source_to_send_sms_when_creating_users', i18n.t('Source'))
  }
}
