import {
  writable,
  derive
} from 'svelte/store.js'
import firebase, { persist } from './firebase.js'
import firebaseConfig from '../../firebase.json'

const alerts = writable({})
const pushAlert = (alert) => {
  if (!alert) return
  const id = Date.now().toString()
  alerts.update(alerts => {
    alerts[id] = alert
    return Object.assign({}, alerts)
  })
  setInterval(() => {
    closeAlert(id)
  }, 30000)
}
const closeAlert = (id) => {
  alerts.update(alerts => {
    delete alerts[id]
    return Object.assign({}, alerts)
  })
}

const columnRules = writable({
  title: {
    title: 'Title',
    type: 'text',
    prefix: '',
    editable: true,
    filterable: true,
    sortable: true,
    isDate: false
  },
  created: {
    title: 'Created',
    type: '',
    prefix: '',
    editable: false,
    filterable: false,
    sortable: true,
    isDate: true
  },
  organization: {
    title: 'Company',
    type: 'text',
    prefix: '',
    editable: true,
    filterable: true,
    sortable: true,
    isDate: false
  },
  person: {
    title: 'Person',
    type: 'text',
    prefix: '',
    editable: true,
    filterable: true,
    sortable: true,
    isDate: false
  },
  value: {
    title: 'Value',
    type: 'number',
    prefix: '$',
    editable: true,
    filterable: false,
    sortable: true,
    isDate: false
  },
  expectDate: {
    title: 'Expect Date',
    type: 'date',
    prefix: '',
    editable: true,
    filterable: false,
    sortable: true,
    isDate: true
  },
  stage: {
    title: 'Stage',
    type: '',
    prefix: '',
    editable: false,
    filterable: true,
    sortable: true,
    isDate: false
  }
})

const validateDeal = (deal) => {
  const title = !deal.title ? 'Title is required' : ''
  const contact = !deal.person && !deal.organization
    ? 'Specify person or company' : ''
  if (!title && !contact) return true
  pushAlert(title || contact)
  return false
}

const DB = firebase(firebaseConfig, pushAlert)
const data = DB.db('Deal', [
  'title',
  'person',
  'organization',
  'stage',
  'expectDate',
  'value'
], validateDeal)
const busy = DB.busy
const dataStore = data.store
const dataState = data.state

const viewStyle = persist('viewStyle', 'list')
const dealsColumns = persist('dealsColumns', [
  'created',
  'title',
  'organization',
  'person',
  'value'
])
const dealsStages = [
  'Loose',
  'Lead In',
  'Contact Made',
  'Prospect Qualified',
  'Needs Defined',
  'Proposal Made',
  'Negotiations started',
  'Won'
]

const stageDeal = async (deal, loose) => {
  /* global prompt */
  const index = dealsStages.indexOf(deal.stage)
  const comment = prompt('Add comment')
  deal.comment = deal.comment || ''
  deal.comment += comment ? `; ${comment}` : ''
  if (!index || !~index || loose) {
    deal.stage = dealsStages[0]
  } else if (index < dealsStages.length - 1) {
    deal.stage = dealsStages[index + 1]
  }
  await data.put(deal)
  pushAlert(deal.title +
    ' went to stage:\n\n' + deal.stage)
}

const allDeals = derive([dataStore], ([deals]) => {
  if (!deals || !deals.length) return { value: 0, count: 0 }
  const result = deals.reduce((a, b) =>
    ({ value: (+a.value || 0) + (+b.value || 0) }))
  result.count = deals.length
  return result
})

const modal = persist('modal', '')
const closeModal = (e) => {
  if (!!e && e.target.nodeName !== 'ASIDE') return
  modal.set('')
}

export {
  busy,
  viewStyle,
  dealsColumns,
  columnRules,
  allDeals,
  stageDeal,
  modal,
  closeModal,
  alerts,
  pushAlert,
  data,
  dataStore,
  dataState,
  closeAlert
}
