import React from 'react'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import {
  ViewState,
  EditingState,
  GroupingState,
  IntegratedGrouping,
  IntegratedEditing
} from '@devexpress/dx-react-scheduler'
import {
  DateNavigator,
  Toolbar,
  Scheduler,
  WeekView,
  MonthView,
  Appointments,
  ViewSwitcher,
  AppointmentTooltip,
  AllDayPanel,
  ConfirmationDialog,
  AppointmentForm,
  CurrentTimeIndicator,
  DragDropProvider,
  TodayButton,
  Resources,
  GroupingPanel
} from '@devexpress/dx-react-scheduler-material-ui'

const SHIFT_KEY = 16

const TextEditor = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === 'multilineTextEditor') {
    return null
  } return <AppointmentForm.TextEditor {...props} />
}

class BasicLayout extends React.Component {
  // TODO: Add some Notification Button or automatic thing
  constructor (props) {
    super(props)

    const newAptData = this.props.appointmentData
    if (newAptData.title === undefined) {
      newAptData.title = 'TYPE - NAME'
    }

    this.state = {
      users: [],
      typeValue: 'driving',
      userValue: '',
      appointmentData: newAptData
    }
  }

  onTypeChange = (nextValue) => {
    this.props.onFieldChange({ nextValue })
    const user = this.state.users[nextValue - 2]
    const aptdata = this.state.appointmentData
    console.log(aptdata)
    this.setState({
      typeValue: nextValue
      // appointmentData: aptdata
    })
  }

  onUserChange = (nextValue) => {
    this.props.onFieldChange({ nextValue })
    const user = this.state.users[nextValue - 2]
    const aptdata = this.state.appointmentData
    // aptdata.title = `${aptdata.oncallType.charAt(0).toUpperCase() + aptdata.oncallType.slice(1)} - ${user.text}`
    console.log(aptdata)
    this.setState({
      userValue: nextValue
      // appointmentData: aptdata
    })
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/settings/team/members?team=technik`)
      .then(res => res.json())
      .then(data => {
        if (data.teamMembers) {
          const team = []
          data.teamMembers.forEach((member, index) => {
            if (member.email === 'device@newtelco.de') return
            if (member.email === null) return
            team.push({ id: index, text: `${member.fname} ${member.lname}` })
          })
          this.setState({
            users: team
          })
        }
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      users,
      userValue,
      typeValue,
      appointmentData
    } = this.state

    return (
      <AppointmentForm.BasicLayout
        appointmentData={appointmentData}
        onFieldChange={this.props.onFieldChange}
        {...this.props}
      >
        {/* <AppointmentForm.Label
          text='User'
          type='ordinary'
        />
        <AppointmentForm.Select
          value={userValue}
          onValueChange={this.onUserChange}
          availableOptions={users}
          type='outlinedSelect'
        />
        <AppointmentForm.Label
          text='Type'
          type='ordinary'
        />
        <AppointmentForm.Select
          value={typeValue}
          onValueChange={this.onTypeChange}
          availableOptions={[{ id: 'driving', text: 'Driving' }, { id: 'email', text: 'Email' }]}
          type='outlinedSelect'
        /> */}
      </AppointmentForm.BasicLayout>
    )
  }
}

const oncallType = [{
  text: 'Driving',
  id: 'driving',
  color: '#67B246'
}, {
  text: 'Email',
  id: 'email',
  color: '#123456'
}]

const techniker = [
  { id: 'nsaldadze@newtelco.de', text: 'Nodar Saldadze' },
  { id: 'fwaleska@newtelco.de', text: 'Felix Waleska' },
  { id: 'alissitsin@newtelco.de', text: 'Andreas Lissitsin' },
  { id: 'sstergiou@newtelco.de', text: 'Stelios Stergiou' },
  { id: 'kmoeller@newtelco.de', text: 'Kay Moeller' },
  { id: 'kkoester@newtelco.de', text: 'Kai Koester' }
]

export default class OnCall extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      schedule: [],
      curDate: moment().format('YYYY-MM-DD'),
      addedAppointment: {},
      appointmentChanges: {},
      editingAppointmentId: undefined,
      // grouping: [{
      //   resourceName: 'oncallType'
      // }],
      resources: [{
        fieldName: 'oncallType',
        title: 'Type',
        instances: oncallType
      }, {
        fieldName: 'email',
        title: 'Person',
        instances: techniker,
        allowMultiple: true
      }]
    }
  }

  componentDidMount = () => {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/team/oncall/schedule`)
      .then(res => res.json())
      .then(data => {
        const schedule = []
        data.query.forEach((data, index) => {
          schedule.push({ id: index, startDate: new Date(data.fromDate), endDate: new Date(data.toDate), title: `${data.oncallType.charAt(0).toUpperCase() + data.oncallType.slice(1)} - ${data.fname} ${data.lname}`, oncallType: data.oncallType, email: [data.email] })
        })
        this.setState({
          schedule
        })
      })
      .catch(err => console.error(err))
  }

  componentWillUnmount = () => {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyDown= (event) => {
    if (event.keyCode === SHIFT_KEY) {
      this.setState({ isShiftPressed: true })
    }
  }

  onKeyUp = (event) => {
    if (event.keyCode === SHIFT_KEY) {
      this.setState({ isShiftPressed: false })
    }
  }

  changeAddedAppointment = (addedAppointment) => {
    this.setState({ addedAppointment })
  }

  changeAppointmentChanges = (appointmentChanges) => {
    this.setState({ appointmentChanges })
  }

  changeEditingAppointmentId = (editingAppointmentId) => {
    this.setState({ editingAppointmentId })
  }

  commitChanges = ({ added, changed, deleted }) => {
    this.setState((state) => {
      let { schedule } = state
      console.log('ss', schedule)
      const { isShiftPressed } = this.state
      if (added) {
        const startingAddedId = schedule.length > 0 ? schedule[schedule.length - 1].id + 1 : 0
        schedule = [...schedule, { id: startingAddedId, ...added }]
      }
      if (changed) {
        if (isShiftPressed) {
          const changedAppointment = schedule.find(appointment => changed[appointment.id])
          const startingAddedId = schedule.length > 0 ? schedule[schedule.length - 1].id + 1 : 0
          schedule = [
            ...schedule,
            { ...changedAppointment, id: startingAddedId, ...changed[changedAppointment.id] }
          ]
        } else {
          schedule = schedule.map(appointment => (
            changed[appointment.id]
              ? { ...appointment, ...changed[appointment.id] }
              : appointment))
        }
      }
      if (deleted !== undefined) {
        schedule = schedule.filter(appointment => appointment.id !== deleted)
      }
      return { schedule }
    })
  }

  currentDateChange = (currentDate) => { this.setState({ curDate: currentDate }) };

  appointmentFieldChange = (data) => {
    console.log(data)
  }

  handleNavigateDate = (date) => {
    console.log(date)
  }

  handleDeleteBtnClick = (e) => {
    console.log(e)
  }

  handleConfirmationClick = (e) => {
    console.log(e)
  }

  render () {
    const {
      schedule,
      addedAppointment,
      appointmentChanges,
      editingAppointmentId,
      curDate,
      grouping,
      resources
    } = this.state

    return (
      <Scheduler
        data={schedule}
      >
        <ViewState
          onCurrentDateChange={this.currentDateChange}
          currentDate={curDate}
        />
        <EditingState
          onCommitChanges={this.commitChanges}

          addedAppointment={addedAppointment}
          onAddedAppointmentChange={this.changeAddedAppointment}

          appointmentChanges={appointmentChanges}
          onAppointmentChangesChange={this.changeAppointmentChanges}

          editingAppointmentId={editingAppointmentId}
          onEditingAppointmentIdChange={this.changeEditingAppointmentId}
        />
        {/* <GroupingState
          grouping={grouping}
        /> */}
        <Toolbar />
        <DateNavigator onNavigate={this.handleNavigateDate} />
        <TodayButton />
        <ViewSwitcher />
        <MonthView />
        <WeekView />
        <AllDayPanel />
        <Appointments
          draggable
        />
        <Resources
          data={resources}
          // mainResourceName='email'
          mainResourceName='oncallType'
        />
        {/* <IntegratedGrouping /> */}
        <IntegratedEditing />
        <ConfirmationDialog
          ignoreCancel
        />
        <AppointmentTooltip
          showOpenButton
          showCloseButton
          showDeleteButton
          onDeleteButtonClick={this.handleDeleteBtnClick}
        />
        <AppointmentForm
          basicLayoutComponent={BasicLayout}
          textEditorComponent={TextEditor}
          // onFieldChange={this.appointmentFieldChange}
          onAppointmentDataChange={this.appointmentFieldChange}
        />
        {/* <GroupingPanel /> */}
        <DragDropProvider />
        <CurrentTimeIndicator
          shadePreviousCells
          shadePreviousAppointments
        />
      </Scheduler>
    )
  }
}
